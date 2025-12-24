# sync.ps1 - Ultrasound project sync
param(
    [ValidateSet("pull", "push", "all")]
    [string]$Action = "all"
)

function Pull-Master {
    Write-Host "Sync master with GitHub..." -ForegroundColor Yellow
    git checkout master
    git pull origin master
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Master up to date!" -ForegroundColor Green
        git status
        $docker = Read-Host "Start Docker? (y/n)"
        if ($docker -eq 'y') { docker-compose up -d }
    } else {
        Write-Host "Sync error. Check conflicts:" -ForegroundColor Red
        git status
    }
}

function Push-To-Master {
    $today = Get-Date -Format "yyyyMMdd"
    $backupBranch = "backup-$today"
    
    Write-Host "Looking for branch $backupBranch..." -ForegroundColor Yellow
    
    if (git branch --list "$backupBranch") {
        Write-Host "Merging $backupBranch to master..." -ForegroundColor Green
        git checkout master
        git pull origin master
        git merge "$backupBranch" -m "Merge $backupBranch"
        git push origin master
        
        $delete = Read-Host "Delete $backupBranch? (y/n)"
        if ($delete -eq 'y') {
            git push origin --delete "$backupBranch"
            git branch -D "$backupBranch"
            Write-Host "Branch deleted" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Backup-$today not found" -ForegroundColor Red
        Write-Host "Available branches:" -ForegroundColor Cyan
        git branch -a
    }
}

switch ($Action) {
    "pull" { Pull-Master }
    "push" { Push-To-Master }
    "all" { 
        Pull-Master
        Push-To-Master 
    }
}

Write-Host "Done!" -ForegroundColor Green
