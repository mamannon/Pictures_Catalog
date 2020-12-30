# Picture Catalog

## Alustus

Tämän projektin idea on web applikaatio, jossa käyttäjä voi selata  aihepiireittäin järjestettyjä kuvia. 

### Vaihe 1

Mahdollisimman yksinkertainen web-applikaatio, joka mahdollistaa ainoastaan olemassa olevien kuvien selaamisen, mutta ei kuvien lisäämistä tai poistamista. Lisäksi mahdollisuus tulostaa kuvia.

### Vaihe 2

Applikaatioon lisätään mahdollisuus lisätä ja poistaa kuvia. Mahdollisuus lisätä kuvatekstejä. Tarkasteltavan kuvan kuvakoon muuttaminen.

### Vaihe 3

Sisäänkirjautuminen.



 

### Tietokanta
#### Käyttäjä User
- id
- käyttäjätunnus
- salasana
- käyttäjänimi

#### Kuvakokoelma PictureSet
- id
- käyttäjäID
- kuvakokoelman nimi

#### Kuva Picture
- id
- käyttäjäID
- url
- kuvateksti
- kuvakokoelman nimi

#### Referenssitaulukko PictureSetPicture
- kuvaID
- kuvakokoelmaID

#### Käyttöoikeuspyyntötaulukko AppliedRight
- anovan käyttäjäID
- omistajan käyttäjäID
- kuvakokoelmaID

#### Käyttöoikeustaulukko AllowedUser
- omistajan käyttäjäID
- käyttöoikeuden saaneen käyttäjätunnus
- kuvakokoelman nimi

### Rajapinnan tiedonvälitysluokat

#### Application
- kuvakokoelman nimi
- kuvakokoelman omistajan nimi
- kuvakokoelman katselijan nimi

#### PictureWrapper
- tilapäinen salasana
- Picture luokka, sama kuin tietokannassa

#### PictureSetWrapper
- tilapäinen salasana
- PictureSet luokka, sama kuin tietokannassa

#### Picture luokka 
-sama kuin tietokannassa

#### Button
- käyttäjänimi (ei käyttäjätunnus)
- kuvakokoelman nimi
- kuvakokoelmaID
- boolean luvuilla 0 ja 1 toteutettuna, kertoo, voiko käyttäjä katsella kuvasetin kuvia

#### IntWrapper
- tilapäinen salasana
- int luku, käytetään kuvakokoelman identifiointiin

#### Subs
- ehdotettu käyttäjänimi
- ehdotettu käyttäjätunnus
- ehdotettu salasana

#### TempLog
- käyttäjätunnus
- tilapäinen salasana

#### LogIn
- käyttäjätunnus
- varsinainen salasana

### TODO
- backendin testaus
- frontendin kuvasettien ryhmittely käyttäjien mukaan
- frontendin kuvasettien nappien väritys sen mukaan, voiko käyttäjä katsella kuvasettiä
- ikkuna, jossa käyttäjä voi nähdä kuvasettiensä käyttöoikeudet ja muuttaa niitä
- tyylit
