cd ..
cd app
gcc app.c -o oxygen-tmp -lgdi32
cd ..
mv app/oxygen-tmp.exe Oxygen.exe
read n