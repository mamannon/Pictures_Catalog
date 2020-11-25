
/*
 * USESWAGGER makro pitää määritellä seuraavissa tiedostoissa:
 * Startup.cs, PictureServerController.cs.
 */

//Käytä swaggeria
//#define USESWAGGER

//Käytä itse koodaamaasi frontendiä
#undef USESWAGGER

using System;
using System.Collections.Generic;
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

        public PictureServerController(PictureDatabase context)
        {
            _context = context;
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
            try
            {
                var buttons = new List<Button>();

                var users = _context.dbUsers.ToList();
                foreach (var user in users)
                {

                    //Tämä rivi lisää nappuloiden listaan käyttäjän ylänappulan
                    //buttons.Add(new Button() { mName = user.mName, mPictureSet = 0 });

                    var psets = _context.dbPictureSets.Where(q => q.cUser == user);
                    foreach (var pset in psets)
                    {
                        var button = new Button();
                        button.mName = user.mName;
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
            

            IList<User> us = new List<User>()
            {
                new User() { mName = "Mikael", mUsername = "Mikael", mPassword = "testtest" },
                new User() { mName = "Simo", mUsername = "Simo", mPassword = "testtest" },

            };
            _context.dbUsers.AddRange(us);
            _context.SaveChanges();

            IList<PictureSet> ps = new List<PictureSet>()
            {
                new PictureSet() { mPictureSet = "Synttärit",
                    cUser = (User)_context.dbUsers.First(c => c.mName == "Mikael") },
                new PictureSet() { mPictureSet = "Valmistujaiset",
                    cUser = (User)_context.dbUsers.First(c => c.mName == "Mikael") },
                new PictureSet() { mPictureSet = "Kreikan matka",
                    cUser = (User)_context.dbUsers.First(c => c.mName == "Simo") }
            };
            _context.dbPictureSets.AddRange(ps);
            _context.SaveChanges();

            IList<Picture> pi = new List<Picture>()
            {
                new Picture() { mLegend = "Valmistujaiset1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184255/samples/animals/three-dogs.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Valmistujaiset").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Valmistujaiset")},
                new Picture() { mLegend = "Valmistujaiset2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184243/samples/animals/reindeer.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Valmistujaiset").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Valmistujaiset")},
                new Picture() { mLegend = "Syttärikuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/pot-mussels.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit")},
                new Picture() { mLegend = "Syttärikuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/fish-vegetables.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit")},
                new Picture() { mLegend = "Syttärikuva3", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184260/samples/food/spices.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Synttärit")},
                new Picture() { mLegend = "Matkakuva1", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184257/samples/landscapes/beach-boat.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Kreikan matka").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Kreikan matka")},
                new Picture() { mLegend = "Matkakuva2", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184261/samples/landscapes/nature-mountains.jpg",
                    mPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Kreikan matka").mPictureSet,
                    cPictureSet = _context.dbPictureSets.First(c => c.mPictureSet == "Kreikan matka")}
            };
            _context.dbPictures.AddRange(pi);
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
            //Luetaan tietokannasta kaikki kuvasetin kuvat listaan
            var pictures = new List<Picture>();
            var result = _context.dbPictures.Where(q => q.cPictureSet.Id == id);  
            foreach (var item in result)
            {
                pictures.Add(item);
            }
            return pictures;

        }

        //poistetaan kuva
        [HttpPost]
        [Route("api/Pictures/RemovePicture/{id}")]
        public int RemovePictureFromDb(int id)
        {
            try
            {
                var picture = _context.dbPictures.FirstOrDefault(p => p.Id == id);
                if(picture!=null)
                {
                    _context.dbPictures.Remove(picture);
                    _context.SaveChanges();
                }
                return 1;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        [HttpPost]
        [Route("api/Pictures/AddPicture")]
        public int AddPictureToDb([FromBody]Picture p)
        {
            try
            {
                Picture pic = new Picture() { mPictureSet = p.mPictureSet, mURL = p.mURL, mLegend = p.mLegend, cPictureSet = _context.dbPictureSets.FirstOrDefault(o => o.Id == p.cPictureSet.Id) };
                _context.dbPictures.Add(pic);
                _context.SaveChanges();
                return 1;
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        //Tällä funtiolla lisätään kuvakokoelma tietokantaan
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

                PictureSet picSet = new PictureSet() { mPictureSet = set.mPictureSet, cUser = _context.dbUsers.FirstOrDefault(c => c.mUsername == set.cUser.mUsername) };
                _context.dbPictureSets.Add(picSet);
                _context.SaveChanges();

                return 1;

            }
            catch
            {
                throw;
            }
        }


        //Tällä funktiolla tallennetaan yksi kuva haluttuun kuvasettiin
#if USESWAGGER
        [HttpPost("Save")]
#else
        [HttpPost]
        [Route("api/Pictures/SavePicture")]
#endif
        
        public IEnumerable<Picture> SavePicture([FromBody]Picture obj)
        {

            //Tallennetaan uusi kuva tietokantaan
            obj.cPictureSet = _context.dbPictureSets.First(q => q.mPictureSet == obj.mPictureSet);
            _context.dbPictures.Add(obj);
            _context.SaveChanges();

            //Luetaan tietokannasta kaikki kuvasetin kuvat listaan
            var pictures = new List<Picture>();
            var result = _context.dbPictures.Where(q => q.mPictureSet == obj.mPictureSet);
            foreach (var item in result)
            {
                pictures.Add(item);
            }
            return pictures;

        }    

        /// <summary>
        /// Etsitään tietokannasta käyttäjä
        /// </summary>
        /// <param name="user">Käyttäjätiedot(username, password)</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/Pictures/Login")]
        public bool UserLogin([FromBody]User user)
        {
            try
            {
                var users = _context.dbUsers.FirstOrDefault(u => u.mUsername == user.mUsername && u.mPassword == user.mPassword);
                if (users != null) return true;
                return false;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/Pictures/Register")]
        public bool UserRegister([FromBody]User user)
        {
            try
            {
                User newUser = new User() { mName = user.mName, mUsername = user.mUsername, mPassword = user.mPassword };
                _context.dbUsers.Add(newUser);
                _context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {

                throw e;
            }
        }
    }
}

