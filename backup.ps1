# Получаем текущую дату в формате YYYYMMDD
$date = Get-Date -Format "yyyyMMdd"

# Создаём уникальное имя ветки
$branchName = "backup-$date"

# Добавляем все изменения
git add .

# Делаем коммит с текущей датой и временем
$time = Get-Date -Format "HHmmss"
git commit -m "Backup on $date-$time"

# Создаём ветку с текущей датой (если не существует)
git checkout -b $branchName 2>$null

# Пушим и сразу привязываем к upstream
git push --set-upstream origin $branchName
