
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
        private static List<TempLog> _currentUsers = new List<TempLog>();

        public class Log
        {
            public string mUser { get; set; }
            public string mPassword { get; set; }
        }

        public class TempLog
        {
            public string mUser { get; set; }
            public int mTemporaryID { get; set; }
        }

        public class PictureWrapper
        {
            public int mKey { get; set; }
            public Picture mPicture { get; set; }
        }

        public class PictureSetWrapper
        {
            public int mKey { get; set; }
            public PictureSet mPictureSet { get; set; }
        }

        public class IntWrapper
        {
            public int mKey { get; set; }
            public int mPSID { get; set; }
        }

        public class Button
        {
            public string mName { get; set; }
            public string mPictureSet { get; set; }
            public int mPSID { get; set; }
        }

        public PictureServerController(PictureDatabase context)
        {
            _context = context;
        }

        //Tällä funktiolla kirjaudutaan sisään.
#if USESWAGGER
          [HttpPost("Login")]
//        [HttpPost]
//        [Route("api/Pictures/Login")]
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
                if (user != null && passwd.mPassword != null && passwd.mUser != null)
                {

                    //Jos käyttäjä on olemassa, luodaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
                    int tunnus = new Random().Next(1, 100000000);
                    _currentUsers.Add(new TempLog(){ mTemporaryID = tunnus, mUser = passwd.mUser });
                    return tunnus;
                }
            }
            catch (Exception e) 
            {
                throw e;
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
            catch (Exception e)
            {
                throw e;
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
                    int tunnus = new Random().Next(1, 100000000);   
                    _currentUsers.Add(new TempLog { mTemporaryID = tunnus, mUser = passwd.mUser });
                    return tunnus;
                }
            }
            catch (Exception e)
            {
                throw e;
            }

            //Uuden käyttäjän luonti epäonnistui.
            return 0;
        }

        //Tätä funktiota kutsutaan frontendin nappuloiden määrittämiseksi    
#if USESWAGGER
        [HttpGet("GetSets")]
#else
        [HttpGet]
        [Route("api/Pictures/GetSets/{id}")]
#endif
        
        public IEnumerable<Button> Get(int id)
        {

            int tempUser = id; 

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

                    var psets = _context.dbPictureSets.Where(q => q.mUserId == user.UserId);
                    foreach (var pset in psets)
                    {
                        var button = new Button();
                        button.mName = user.mName;
                        button.mPictureSet = pset.mPictureSet;
                        button.mPSID = pset.PictureSetId;
                        buttons.Add(button);
                    }
                }

                return buttons;
            }
            catch (Exception e)
            {
                throw e;
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
                new User() { mUser = "userMikael", mName = "Mikael", mPassword = "passMikael" },
                new User() { mUser = "userSimo", mName = "Simo", mPassword = "passSimo" }

            };
            /*
            us[0].cPictureSets.Add(new PictureSet() { PictureSetId = 1 });
            us[0].cPictureSets.Add(new PictureSet() { PictureSetId = 2 });
            us[1].cPictureSets.Add(new PictureSet() { PictureSetId = 3 });
            /*
            _context.dbPictureSetItems.Add(us[0].cPictureSets[0]);
            _context.dbPictureSetItems.Add(us[0].cPictureSets[1]);
            _context.dbPictureSetItems.Add(us[1].cPictureSets[0]);
            */
            _context.dbUsers.AddRange(us);
            try
            {
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<PictureSet> ps = new List<PictureSet>()
            {
                new PictureSet() { mPictureSet = "Synttärit" },
                new PictureSet() { mPictureSet = "Valmistujaiset" },
                new PictureSet() { mPictureSet = "Kreikan matka" }
            };
            /*
            ps[0].cPictures.Add(new Picture() { PictureId = 3 });
            ps[0].cPictures.Add(new Picture() { PictureId = 4 });
            ps[0].cPictures.Add(new Picture() { PictureId = 5 });
            ps[1].cPictures.Add(new Picture() { PictureId = 1 });
            ps[1].cPictures.Add(new Picture() { PictureId = 2 });
            ps[2].cPictures.Add(new Picture() { PictureId = 6 });
            ps[2].cPictures.Add(new Picture() { PictureId = 7 });
            /*
            _context.dbPictureItems.Add(ps[0].cPictures[0]);
            _context.dbPictureItems.Add(ps[0].cPictures[1]);
            _context.dbPictureItems.Add(ps[0].cPictures[2]);
            _context.dbPictureItems.Add(ps[1].cPictures[0]);
            _context.dbPictureItems.Add(ps[1].cPictures[1]);
            _context.dbPictureItems.Add(ps[2].cPictures[0]);
            _context.dbPictureItems.Add(ps[2].cPictures[1]);
            */
            _context.dbPictureSets.AddRange(ps);
            try
            {
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<Picture> pi = new List<Picture>()
            {
                new Picture() { mLegend = "Valmistujaiset1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184255/samples/animals/three-dogs.jpg" },
                new Picture() { mLegend = "Valmistujaiset2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184243/samples/animals/reindeer.jpg" },
                new Picture() { mLegend = "Synttärikuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/pot-mussels.jpg" },
                new Picture() { mLegend = "Synttärikuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/fish-vegetables.jpg" },
                new Picture() { mLegend = "Synttärikuva3", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184260/samples/food/spices.jpg" },
                new Picture() { mLegend = "Matkakuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184257/samples/landscapes/beach-boat.jpg" },
                new Picture() { mLegend = "Matkakuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184261/samples/landscapes/nature-mountains.jpg" }
            };
            _context.dbPictures.AddRange(pi);
            try
            {
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            //Yllä oleva on testausta varten

        }

        //Tätä funktiota kutsutaan tietyn kuvasetin kaikkien kuvien saamiseksi     
#if USESWAGGER
        [HttpPost("GetPictures")]
#else
        [HttpPost]
        [Route("api/Pictures/GetPictures")]
#endif

        public IEnumerable<Picture> GetAllPictures([FromBody]IntWrapper id)
        {

            List<Picture> pictures = new List<Picture>();
            int tempUser = id.mKey;

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                PictureSet picSet = _context.dbPictureSets.Find(id.mPSID);
                foreach (var pic in picSet.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(pic));
                }
            }
            catch (Exception e)
            {
                throw e;
            }

            // Palautetaan kuvat
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
        public int AddSet([FromBody]PictureSetWrapper set)
        {
            try
            {
                PictureSet picSet = set.mPictureSet;
                int tempUser = set.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null) return 0;

                //Jotta kuvasetti voitaisiin lisätä, pitää kaikki kuvasetin kuvat olla 
                //jo lisättynä tämän käyttäjän tilille. 
                for (int i=0; i<picSet.cPictures.Count; i++)
                {
                    Picture pic = null;
                    pic = _context.dbPictures.First(q => picSet.cPictures.ElementAt(i).mPictureId == q.PictureId);

                    //Jos kuvaa ei ole tietokannassa, lopetetaan ja palautetaan 0:
                    if (pic == null) return 0;

                    /* Tarpeeton?
                    //Jos kuva on tietokannassa, korvataan sillä frontendin ehdotus kuvaksi
                    picSet.cPictures.RemoveAt(i);
                    PictureItem temp = new PictureItem() { mPictureId = pic.Id };
                    picSet.cPictures.Insert(i, temp);
                    */
                }

                //Kaikki kuvat löytyivät tietokannasta. Lisätään kuvasetti tietokantaan tämän käyttäjän nimiin.
                picSet.mUserId = _context.dbUsers.First(q => user.mUser == q.mUser).UserId;
                _context.dbPictureSets.Add(picSet);
                _context.SaveChanges();

                return 1;

            }
            catch (Exception e)
            {
                throw(e);
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
        
        public IEnumerable<Picture> SavePicture([FromBody]PictureWrapper obj)
        {

            int tempUser = obj.mKey;

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {
                Picture pic = obj.mPicture;
                string picSetName = pic.mPictureSet;

                //Tallennetaan uusi kuva tietokantaan.
                PictureSet picSet = null;
                picSet = _context.dbPictureSets.First(q => q.mPictureSet == picSetName);
                int userId = _context.dbUsers.First(o => o.mUser == user.mUser).UserId;
                if (picSet == null)
                {

                    //Jos halutun nimistä kuvasettiä ei ole olemassa, se pitää luoda.
                    picSet = new PictureSet() { mPictureSet = picSetName };
                    picSet.mUserId = userId;
                    _context.dbPictureSets.Add(picSet);
                    _context.SaveChanges();
                }
                _context.dbPictures.Add(pic);
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, mukaan lukien äsken lisätty, listaan
                var pictures = new List<Picture>();
                var result = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == userId));
                foreach (var item in result.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(item));
                }
                return pictures;
            }
            catch (Exception e)
            {
                throw e;
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

        public IEnumerable<Picture> RemovePicture([FromBody] PictureWrapper obj)
        {

            int tempUser = obj.mKey;
            
            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return null;

            try
            {
                string picSetName = obj.mPicture.mPictureSet;
                Picture pic = obj.mPicture;
                int userId = _context.dbUsers.First(q => user.mUser == q.mUser).UserId;
                PictureSet picSet = null;
                picSet = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == userId));

                //Jos kyseinen kuvasetti on olemassa...
                if (picSet != null)
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa...
                    PictureSetPicture p = null;
                    p = picSet.cPictures.First(q => q.mPictureId == pic.PictureId);
                    if (p != null)
                    {
 //                       _context.dbPictureSets.Remove(picSet);

                        //Poistetaan kuva annetun kuvasetin listauksesta
                        picSet.cPictures.Remove(p);

 //                       _context.dbPictureSets.Add(picSet);
                    }

                }
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, pois lukien äsken poistettu, listaan
                var pictures = new List<Picture>();
                var result = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == userId));
                foreach (var item in result.cPictures)
                {
                    pictures.Add(_context.dbPictures.Find(item));
                }
                return pictures;
            }
            catch (Exception e)
            {
                throw e;
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

        public void DeletePicture([FromBody] PictureWrapper obj)
        {

            int tempUser = obj.mKey;

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null) return;

            try
            {
                Picture pic = obj.mPicture;
                int del = -1;
                int userId = _context.dbUsers.First(q => user.mUser == q.mUser).UserId;

                foreach (var picSet in _context.dbPictureSets.Where(q => q.mUserId == userId))
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa...
                    PictureSetPicture p = null;
                    p = picSet.cPictures.First(q => (pic.PictureId == q.mPictureId));
                    if (p != null)
                    {
                        del = p.mPictureId;

 //                       _context.dbPictureSets.Remove(picSet);

                        //Poistetaan kuva annetun kuvasetin listauksesta
                        picSet.cPictures.Remove(p);

 //                       _context.dbPictureSets.Add(picSet);
                    }
                }
                if (del != -1)
                    _context.dbPictures.Remove(_context.dbPictures.Find(del));
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}

