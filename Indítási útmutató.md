Letöltési és futtatási útmutató
A projekt helyi futtatásához kövesd az alábbi lépéseket:

Projekt klónozása
Először győződj meg róla, hogy a gépeden telepítve van a Git. Ezután a terminálba írd be a következőt:
git clone https://github.com/MagicPie0/TopForm

Szükséges programok telepítése
A futtatáshoz szükség van az alábbiakra:

Node.js

Python 3.13

Visual Studio 2022

XAMPP (MySQL adatbáziskezelővel)

Python csomagok telepítése
Navigálj el a következő mappába:
TopForm\ReactApp1.Server\AI
Itt futtasd a következő parancsot:
pip install -r requirements.txt

Adatbázis beállítása

Indítsd el a XAMPP-ot, és hozz létre egy új adatbázist topform néven.

A karakterkódolás legyen: utf8_general_hungarian_ci

Importáld be a topform.sql fájlt az adatbázisba.

Projekt indítása

Nyisd meg a projektet Visual Studio 2022-ben.

Kattints a Start gombra a projekt indításához.

Néhány másodperc múlva két hibaüzenet jelenhet meg, ezeket nyugodtan zárd be az "OK" gombbal.

Ha megjelenik a Swagger dokumentáció, a megnyíló parancssorban írd be az o betűt, majd várj, amíg betölt a frontend felület.

Fontos: alacsony teljesítményű gépen, nem fog teljes mértékben hibátlanul működni!
