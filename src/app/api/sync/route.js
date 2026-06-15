import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(request) {
  if (process.platform !== 'win32') {
    return NextResponse.json({ success: false, error: 'Cloud sync can only be triggered from your local Windows PC.' }, { status: 400 });
  }

  try {
    const gitCommand = `$git = (Get-ChildItem -Path "$env:LOCALAPPDATA\\GitHubDesktop\\app-*\\resources\\app\\git\\cmd\\git.exe" | Select-Object -First 1).FullName; & $git add .; & $git commit -m "feat: Admin Cloud Sync"; & $git push origin main`;
    
    await execPromise(gitCommand, { shell: 'powershell.exe' });
    
    return NextResponse.json({ success: true, message: 'Successfully synced to cloud!' });
  } catch (error) {
    console.error("Sync error:", error);
    
    // Ignore error if it's just "nothing to commit" but still push just in case
    if (error.message && error.message.includes("nothing to commit")) {
        try {
            const pushCommand = `$git = (Get-ChildItem -Path "$env:LOCALAPPDATA\\GitHubDesktop\\app-*\\resources\\app\\git\\cmd\\git.exe" | Select-Object -First 1).FullName; & $git push origin main`;
            await execPromise(pushCommand, { shell: 'powershell.exe' });
            return NextResponse.json({ success: true, message: 'Successfully synced to cloud!' });
        } catch (pushError) {
            return NextResponse.json({ success: false, error: pushError.message }, { status: 500 });
        }
    }
    
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
