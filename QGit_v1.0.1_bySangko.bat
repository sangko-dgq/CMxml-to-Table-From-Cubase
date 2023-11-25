@echo off
chcp 65001
setlocal enabledelayedexpansion

title QGit v1.0 by Sangko


:menu
cls
color 07

echo ====================
echo QGit v1.0 by Sangko
echo ====================


echo ================== 拉取仓库 ==================
echo.
echo 0. 拉取仓库到当前目录下
echo.
echo P. 打开对应的远程仓库地址

echo ================== 仓库操作 ==================
echo.
echo 1. 添加文件到暂存区
echo.
echo 2. 提交更改到本地仓库
echo.
echo 3. 推送更改到远程仓库
echo.
echo 4. 一键推送
echo.
echo 5. 退出
echo.
echo =============================================





set /p choice="请选择操作："

if "%choice%"=="1" (
    call :check_git_repo
    if !git_repo!==false (
        color 04
        echo 当前目录不是一个 Git 仓库，请进入正确的目录后再试.
        pause
        goto :menu
    )
    call :add_files
) else if "%choice%"=="2" (
    call :check_git_repo
    if !git_repo!==false (
       color 04
        echo 当前目录不是一个 Git 仓库，请进入正确的目录后再试.
        pause
        goto :menu
    )
    call :commit_files
) else if "%choice%"=="3" (
    call :check_git_repo
    if !git_repo!==false (
       color 04
        echo 当前目录不是一个 Git 仓库，请进入正确的目录后再试.
        pause
        goto :menu
    )
    call :push_files
) else if "%choice%"=="4" (
    call :check_git_repo
    if !git_repo!==false (
       color 04
        echo 当前目录不是一个 Git 仓库，请进入正确的目录后再试.
        pause
        goto :menu
    )
    call :one_key_push
) else if "%choice%"=="5" (
    goto :exit
) else if "%choice%"=="0" (
    
    
    call :Clone_Res
     pause
     goto :menu
   
) else if "%choice%"=="P" (
setlocal enabledelayedexpansion
set /p choice_isToGithub="是否打开远程仓库？ [Y/N]"
echo 234"!choice_isToGithub!"
if "!choice_isToGithub!"=="Y" (
    echo "!choice_isToGithub!"
    call :ToGithub
)
pause
goto :menu

) 
else (
    echo 无效的选择，请重新输入.
    color 04
    pause
    goto :menu
)

:check_git_repo
set git_repo=false
if exist "%cd%\.git" set git_repo=true
goto :eof

:add_files
echo.
echo 正在添加文件到暂存区...
color 0E

git add .
echo.
echo 文件已成功添加到暂存区.
color 0A
call :Delay_1s
    goto :menu

:commit_files
echo.
echo 正在提交更改到本地仓库...
color 0E

set /p commit_message="请输入提交消息(留空默认为 "Fix_日期时间" 格式): "
if "%commit_message%"=="" (
rem echo 未输入提交消息，请重新输入.
    echo 提交信息为"Fix_%date%_%time%"
    git commit -m "Fix_%date%_%time%"
    echo.
    echo 更改已成功提交到本地仓库.
    color 0A
    call :Delay_1s
    goto :menu
rem     goto :commit_files
) else (
    echo 提交信息为"%commit_message%"
    git commit -m "%commit_message%"
    echo.
    echo 更改已成功提交到本地仓库.
    color 0A
call :Delay_1s
    goto :menu
)

:push_files
echo.
echo 正在推送更改到远程仓库...
color 0E

git remote update origin --prune
git remote set-head origin -d

echo.
setlocal enabledelayedexpansion

set branch_options =
for /f "tokens=1" %%i in ('git branch -r') do (
    set branch_options=!branch_options! %%i
    echo %%i
)

set /p branch_name="请选择已有分支或创建新的分支名称 [%branch_options%] （留空默认推送到当前所在分支）: "

if "%branch_name%"=="" (

    REM 获取当前分支名称，并传递给branch_Name变量
    for /f "delims=" %%i in ('git symbolic-ref --short HEAD') do set branch_Name=%%i
    REM 打印当前分支名称
    echo 未选择或输入新的分支名称，采用默认目前所处的分支：%branch_Name%
    
rem     echo 未选择或输入新的分支名称，请重新输入.
rem     goto :push_files
    
    
)

git branch -r | findstr /i /c:"%branch_name%"
if %errorlevel%==1 (
    set /p create_new_branch="分支 %branch_name% 不存在，是否创建新分支？ [Y/N]: "
    if /i "%create_new_branch%"=="Y" (
        git checkout -b %branch_name%
        echo.
        echo 分支 %branch_name% 创建成功.
    ) else (
        echo 未创建新分支.
        goto :push_files
    )
)

git checkout %branch_name%
git push -f origin %branch_name%
echo.
echo 更改已成功推送到远程仓库的分支 %branch_name%.
color 0A

setlocal enabledelayedexpansion
set /p choice_isToGithub="是否打开远程仓库？ [Y/N]"
echo 234"!choice_isToGithub!"
if "!choice_isToGithub!"=="Y" (
    echo "!choice_isToGithub!"
    call :ToGithub
)
pause
goto :menu
pause
    goto :menu

:one_key_push
echo.
echo 正在执行一键推送...
color 0E

rem call :add_files
rem call :commit_files
rem call :push_files


echo 正在添加文件到暂存区...
color 0E
git add .
echo.
echo 文件已成功添加到暂存区.
color 0A

echo.
echo 正在提交更改到本地仓库...
color 0E
set /p commit_message="请输入提交消息(留空默认为 "Fix_日期时间" 格式): "
if "%commit_message%"=="" (
    echo 提交信息为"Fix_%date%_%time%"
    git commit -m "Fix_%date%_%time%"
    echo.
    echo 更改已成功提交到本地仓库.
    color 0A
) else (
    echo 提交信息为"%commit_message%"
    git commit -m "%commit_message%"
    echo.
    echo 更改已成功提交到本地仓库.
    color 0A
)
call :push_files

pause
    goto :menu


:Delay_1s
echo.
timeout /t 1 /nobreak >nul
goto :eof

:Clone_Res
echo.
@echo off
set /p repo_url="请输入远程仓库的URL: "
for %%i in ("%repo_url:/=" "%") do set repo_name=%%~ni
set target_dir="%cd%\%repo_name%"
if not exist "%repo_name%" (
    mkdir "%repo_name%"
) else (
    echo 【错误！】当前目录下已经存在 %repo_name% 文件夹，无法拉取，建议新建一个空目录，将本.bat放入该目录下拉取重试！
    color 04
    pause
    goto :menu
    
)
cd %target_dir%
echo 正在拉取代码到目标目录 %target_dir% ...
color 0E
git clone %repo_url% .

if %errorlevel% neq 0 (
   color 04
    echo 代码拉取失败！
     pause
    goto :menu
)
echo 代码拉取完成！
color 0A

goto :eof


:ToGithub
echo.
 echo 正在打开对应的远程仓库地址...
    for /f "delims=" %%i in ('git config --get remote.origin.url') do set repo_url=%%i
    start "" %repo_url%
goto :eof

:exit
exit /b