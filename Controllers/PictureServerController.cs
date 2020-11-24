
/*
 * USESWAGGER makro pitää määritellä seuraavissa tiedostoissa:
 * Startup.cs, PictureServerController.cs.
 */

//Käytä swaggeria
#define USESWAGGER

//Käytä itse koodaamaasi frontendiä
//#undef USESWAGGER

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Picture_Catalog.Controllers
{

    public class PictureServerController : ControllerBase
    {

        private readonly PictureDatabase _context;
        private List<TempLog> _currentUsers; 

        public PictureServerController(PictureDatabase context)
        {
            _context = context;
            _currentUsers = new List<TempLog>();
            _currentUsers.Add(new TempLog() { mTemporaryID = 1, mUser = "Matti" });  //TODO: tämä rivi pitää poistaa!!!
        }

        //Tällä funktiolla kirjaudutaan sisään.
#if USESWAGGER
        [HttpPost("Login")]
#else
        [HttpPost]
        [Route("api/Pictures/Login")]
#endif
        public int Login([FromBody]Log passwd)
        {

            try
            {

                //Katsotaan löytyykö käyttäjää, jonka nimi ja salasana täsmäävät
                IQueryable<User> user = null;
                user = _context.dbUsers.Where(q => (q.mUser == passwd.mUser && q.mPassword == passwd.mPassword));
                if (user != null)
                {

                    //Jos käyttäjä on olemassa, luodaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
                    int tunnus = new Random().Next(1, 100000000);
                    _currentUsers.Add(new TempLog { mTemporaryID = tunnus, mUser = passwd.mUser });
                    return tunnus;
                }
            }
            catch 
            {
                throw;
            }

            //Kirjautumisyritys evätään.
            return 0;
        }

        //Tällä funktiolla kirjaudutaan ulos.
#if USESWAGGER
        [HttpPost("Logout")]
#else
        [HttpPost]
        [Route("api/Pictures/Logout")]
#endif
        public int Logout([FromBody] TempLog passwd)
        {

            try
            {

                //Katsotaan löytyykö käyttäjää, jonka nimi ja salasana täsmäävät
                TempLog user = null;
                user = _currentUsers.First(q => (q.mUser == passwd.mUser && q.mTemporaryID == passwd.mTemporaryID));
                if (user != null)
                {

                    //Jos käyttäjä on olemassa, poistetaan sen loggaus.
                    _currentUsers.Remove(user);
                    return 1;
                }
            }
            catch
            {
                throw;
            }

            //Kirjautumisyritys evätään.
            return 0;
        }

        //Tällä funktiolla luodaan uusi käyttäjä
#if USESWAGGER
        [HttpPost("Subscribe")]
#else
        [HttpPost]
        [Route("api/Pictures/Login")]
#endif
        public int Subscribe([FromBody] Log passwd)
        {

            try
            {

                //Katsotaan onko kyseinen käyttäjänimi jo käytössä
                IQueryable<User> user = null;
                user = _context.dbUsers.Where(q => q.mUser == passwd.mUser);
                if (user == null)
                {

                    //Jos käyttäjänimi on vapaa, luodaan uusi käyttäjä tietokantaan...
                    User temp = new User() { mUser = passwd.mUser, mPassword = passwd.mPassword };
                    _context.dbUsers.Add(temp);
                    _context.SaveChanges();

                    //...ja annetaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
 //                   int tunnus = new Random().Next(1, 100000000);   //TODO: kun kirjautuminen on mahdollistettu frontendissä, otetaan tämä rivi käyttöön.
                    int tunnus = 1;  //TODO: Tämä rivi tulee poistaa käytöstä!
                    _currentUsers.Add(new TempLog { mTemporaryID = tunnus, mUser = passwd.mUser });
                    return tunnus;
                }
            }
            catch
            {
                throw;
            }

            //Uuden käyttäjän luonti epäonnistui.
            return 0;
        }

        //Tätä funktiota kutsutaan frontendin nappuloiden määrittämiseksi    
#if USESWAGGER
        [HttpGet("GetSets")]
#else
        [HttpGet]
        [Route("api/Pictures/GetSets")]
#endif
        
        public IEnumerable<Button> Get()
        {

            int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!

            // Katsotaan, onko käyttäjä olemassa.
            TempLog usr = null;
            usr = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (usr == null) return null;

            try
            {

                var buttons = new List<Button>();

                var users = _context.dbUsers.ToList();
                foreach (var user in users)
                {

                    //Tämä rivi lisää nappuloiden listaan käyttäjän ylänappulan
                    //buttons.Add(new Button() { mName = user.mName, mPictureSet = 0 });

                    var psets = _context.dbPictureSets.Where(q => q.mUserId == user.Id);
                    foreach (var pset in psets)
                    {
                        var button = new Button();
                        button.mUser = user.mUser;
                        button.mPictureSet = pset.mPictureSet;
                        button.mPSID = pset.Id;
                        buttons.Add(button);
                    }
                }

                return buttons;
            }
            catch
            {
                throw;
            }
        }

        //Tällä funktiolla alustetaan tietokanta
        public static void Initialize(PictureDatabase _context)
        {
            _context.Database.EnsureCreated();

            if (_context.dbPictureSets.Any()) return;
            //Alla oleva on testausta varten

            List<User> us = new List<User>()
            {
                new User() { mUser = "Mikael" },
                new User() { mUser = "Simo" },

            };
            _context.dbUsers.AddRange(us);
            _context.SaveChanges();

            List<Picture> pi = new List<Picture>()
            {
                new Picture() { mLegend = "Valmistujaiset1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184255/samples/animals/three-dogs.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id },
                new Picture() { mLegend = "Valmistujaiset2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184243/samples/animals/reindeer.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id },
                new Picture() { mLegend = "Synttärikuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/pot-mussels.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id },
                new Picture() { mLegend = "Synttärikuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/fish-vegetables.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id },
                new Picture() { mLegend = "Synttärikuva3", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184260/samples/food/spices.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id },
                new Picture() { mLegend = "Matkakuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184257/samples/landscapes/beach-boat.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Simo").Id },
                new Picture() { mLegend = "Matkakuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184261/samples/landscapes/nature-mountains.jpg",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Simo").Id },
            };
            _context.dbPictures.AddRange(pi);
            _context.SaveChanges();

            List<PictureSet> ps = new List<PictureSet>()
            {
                new PictureSet() { mPictureSet = "Synttärit",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id,
                    cPictures = new List<int> { pi[2].Id, pi[3].Id, pi[4].Id } },
                new PictureSet() { mPictureSet = "Valmistujaiset",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Mikael").Id,
                    cPictures = new List<int> { pi[0].Id, pi[1].Id } },
                new PictureSet() { mPictureSet = "Kreikan matka",
                    mUserId = _context.dbUsers.First(c => c.mUser == "Simo").Id,
                    cPictures = new List<int> { pi[5].Id, pi[6].Id} }
            };
            _context.dbPictureSets.AddRange(ps);
            _context.SaveChanges();

            User mikael = _context.dbUsers.First(o => o.mUser == "Mikael");
            mikael.cPictureSets = new List<PictureSet> { ps[0], ps[2] };
            _context.SaveChanges();

            //Testausta...
            mikael = _context.dbUsers.First(o => o.mUser == "Mikael");

            User simo = _context.dbUsers.First(o => o.mUser == "Simo");
            simo.cPictureSets = new List<PictureSet> { ps[2] };
            _context.SaveChanges();
            //Yllä oleva on testausta varten


        }

        //Tätä funktiota kutsutaan tietyn kuvasetin kaikkien kuvien saamiseksi     
#if USESWAGGER
        [HttpPost("GetPictures")]
#else
        [HttpPost]
        [Route("api/Pictures/GetPictures/{id}")]
#endif

        public IEnumerable<Picture> GetAllPictures(int id)
        {

            List<Picture> pictures = new List<Picture>();
            int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {

                //Testausta, tosi outoa... Kokeile ohjelmaa alla oleva rivi kommentoituna!!
                Picture koe = _context.dbPictures.First(o => true);

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                PictureSet picSet = _context.dbPictureSets.Find(id);
                foreach (var pic in picSet.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(pic));
                }
            }
            catch
            {
                throw;
            }

            // Palautetaan kuvat tai null
            return pictures;
        }


        //Tällä funtiolla lisätään kuvakokoelma tietokantaan. Koska kuvakokoelman sisältävien
        //kuvien pitää olla valmiiksi olemassa tietokannassa kyseisellä käyttäjällä, tämä toiminto
        //on itse asiassa pelkkä kuvien järjestelytyökalu: olemassa olevista kuvista voi luoda uusia 
        //kuvasettejä.
#if USESWAGGER
        [HttpPost("AddPictureset")]
#else
        [HttpPost]
        [Route("api/Pictures/AddPictureset")]
#endif
        public int AddSet([FromBody]PictureSet set)
        {
            try
            {
                PictureSet picSet = set;
                int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null) return 0;

                //Jotta kuvasetti voitaisiin lisätä, pitää kaikki kuvasetin kuvat olla 
                //jo lisättynä tämän käyttäjän tilille. 
                for (int i=0; i<picSet.cPictures.Count; i++)
                {
                    Picture pic = null;
                    pic = _context.dbPictures.First(q => picSet.cPictures[i] == q.Id);

                    //Jos kuvaa ei ole tietokannassa, lopetetaan ja palautetaan 0:
                    if (pic == null) return 0;

                    //Jos kuva on tietokannassa, korvataan sillä frontendin ehdotus kuvaksi
                    picSet.cPictures.RemoveAt(i);
                    picSet.cPictures.Insert(i, pic.Id);
                }

                //Kaikki kuvat löytyivät tietokannasta. Lisätään kuvasetti tietokantaan tämän käyttäjän nimiin.
                picSet.mUserId = _context.dbUsers.First(q => user.mUser == q.mUser).Id;
                _context.dbPictureSets.Add(picSet);
                _context.SaveChanges();

                return 1;

            }
            catch
            {
                throw;
            }
        }


        //Tällä funktiolla tallennetaan yksi kuva tietokantaan kyseisen käyttäjän tilille haluttuun 
        //kuvasettiin. Jos haluttua kuvasettiä ei vielä ole olemassa, se luodaan.
#if USESWAGGER
        [HttpPost("Save")]
#else
        [HttpPost]
        [Route("api/Pictures/SavePicture")]
#endif
        
        public IEnumerable<Picture> SavePicture([FromBody]Picture obj)
        {

            int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!
            string picSetName = "Default"; //TODO: picSet on PictureSet:n nimi, joka pitää frontendin toimittaa!!!

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {
                Picture pic = obj;

                //Tallennetaan uusi kuva tietokantaan.
                PictureSet picSet = null;
                picSet = _context.dbPictureSets.First(q => q.mPictureSet == picSetName);
                pic.mUserId = _context.dbUsers.First(q => user.mUser == q.mUser).Id;
                if (picSet == null)
                {

                    //Jos halutun nimistä kuvasettiä ei ole olemassa, se pitää luoda.
                    picSet = new PictureSet() { mUserId = pic.mUserId, mPictureSet = picSetName };
                    _context.dbPictureSets.Add(picSet);
                    _context.SaveChanges();
                }
                _context.dbPictures.Add(pic);
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, mukaan lukien äsken lisätty, listaan
                var pictures = new List<Picture>();
                var result = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == pic.mUserId));
                foreach (var item in result.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(item));
                }
                return pictures;
            }
            catch
            {
                throw;
            }
        }

        //Tällä funktiolla poistetaan yksi kuva käyttäjän valitsemasta kuvasetistä, mutta itse kuvaa ei poisteta 
        //tietokannasta.
#if USESWAGGER
        [HttpPost("Remove")]
#else
        [HttpPost]
        [Route("api/Pictures/RemovePicture")]
#endif

        public IEnumerable<Picture> RemovePicture([FromBody] Picture obj)
        {

            int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!
            string picSetName = "Default"; //TODO: picSet on PictureSet:n nimi, joka pitää frontendin toimittaa!!!

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {
                Picture pic = obj;
                pic.mUserId = _context.dbUsers.First(q => user.mUser == q.mUser).Id;
                PictureSet picSet = null;
                picSet = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == pic.mUserId));

                //Jos kyseinen kuvasetti on olemassa...
                if (picSet != null)
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa...
                    int p = -1;
                    p = picSet.cPictures.First(q => q == pic.Id);
                    if (p != -1)
                    {
 //                       _context.dbPictureSets.Remove(picSet);

                        //Poistetaan kuva annetun kuvasetin listauksesta
                        int index = picSet.cPictures.IndexOf(p);
                        picSet.cPictures.RemoveAt(index);

 //                       _context.dbPictureSets.Add(picSet);
                    }

                }
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, pois lukien äsken poistettu, listaan
                var pictures = new List<Picture>();
                var result = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == pic.mUserId));
                foreach (var item in result.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(item));
                }
                return pictures;
            }
            catch
            {
                throw;
            }
        }

        //Tällä funktiolla tuhotaan yksi kuva käyttäjän tililtä ja poistetaan se kaikista kuvaseteistä,
        //missä se on olemassa.
#if USESWAGGER
        [HttpPost("Delete")]
#else
        [HttpPost]
        [Route("api/Pictures/DeletePicture")]
#endif

        public void DeletePicture([FromBody] Picture obj)
        {

            int tempUser = 1; //TODO: tempUser on tilapäinen login tunnus, joka pitää frontendin toimittaa!!!

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return;

            try
            {
                Picture pic = obj;
                int del = -1;
                pic.mUserId = _context.dbUsers.First(q => user.mUser == q.mUser).Id;

                foreach (var picSet in _context.dbPictureSets.Where(q => q.mUserId == pic.mUserId))
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa...
                    int p = -1;
                    p = picSet.cPictures.First(q => (pic.Id == q));
                    if (p != -1)
                    {
                        del = p;

 //                       _context.dbPictureSets.Remove(picSet);

                        //Poistetaan kuva annetun kuvasetin listauksesta
                        int index = picSet.cPictures.IndexOf(p);
                        picSet.cPictures.RemoveAt(index);

 //                       _context.dbPictureSets.Add(picSet);
                    }
                }
                if (del != -1)
                    _context.dbPictures.Remove(_context.dbPictures.Find(del));
                _context.SaveChanges();
            }
            catch
            {
                throw;
            }
        }

    }
}

