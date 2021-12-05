﻿
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
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Serialization;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Timers;

namespace Picture_Catalog.Controllers
{

    //public class PictureServerController : ControllerBase
    public class PictureServerController : Controller
    {

        private readonly PictureDatabase _context;
        private static List<TempLog> _currentUsers = new List<TempLog>();
        private static List<string> _publicIds = new List<string>();
        private static Timer _timer;

        public class Error
        {
            public int mCode { get; set; }
            public string mMessage { get; set; }
            public string mDetails { get; set; }
        }

        public class LogIn
        {
            public string mUser { get; set; }
            public string mPassword { get; set; }
        }

        public class TempLog
        {
            public string mUser { get; set; }
            public int mTemporaryID { get; set; }
            public DateTime mLogTime { get; set; }
        }

        public class Subs
        {
            public string mUser { get; set; }
            public string mName { get; set; }
            public string mPassword { get; set; }
        }

        public class PictureWrapper
        {
            public int mKey { get; set; }
            public Picture mPicture { get; set; }
        }

        public class PictureSetWrapper
        {
            public int mKey { get; set; }
            public PictureSet cPictureSet { get; set; }
        }

        public class IntWrapper
        {
            public int mKey { get; set; }
            public int mPSID { get; set; }
        }

        public class Button
        {
            public int mAccessible { get; set; }
            public string mName { get; set; }
            public string mPictureSet { get; set; }
            public int mPSID { get; set; }
        }

        public class Application
        {
            public string mPictureSet { get; set; }
            public string mApplicantName { get; set; }
            public string mApplicantUser { get; set; }
        }

        public PictureServerController(PictureDatabase context)
        {
            _context = context;
            _timer = new Timer(3600000);
            _timer.Elapsed += new ElapsedEventHandler(timer_Elapsed);
            _timer.Start();
        }

        /// <summary>
        /// Timeria tarvitaan putsaamaan pois sessiot, joissa ei ole tapahtunut tuntiin mitään.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        static void timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            int temp = _currentUsers.Count;
            for (int i=0; i < temp; i++)
            {
                if (_currentUsers[i].mLogTime.AddHours(1) < DateTime.Now)
                {
                    _currentUsers.RemoveAt(i);
                    temp--;
                }
            }
        }

            /// <summary>
            /// Tällä funktiolla kirjaudutaan sisään.
            /// </summary>
            /// <param name="passwd"></param>
            /// <returns></returns>
#if USESWAGGER
        [HttpPost("Login")]
//        [HttpPost]
//        [Route("api/Pictures/Login")]
#else
        [HttpPost]
        [Route("api/Pictures/Login")]
#endif
        public Subs Login([FromBody]LogIn passwd)
        {

            try
            {

                //Katsotaan löytyykö käyttäjää, jonka nimi ja salasana täsmäävät
                User user = _context.dbUsers.FirstOrDefault(q => (q.mUser == passwd.mUser && q.mPassword == passwd.mPassword));
                if (user != null && passwd.mPassword != null && passwd.mUser != null)
                {

                    //Jos käyttäjä on olemassa, luodaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
                    int tunnus = new Random().Next(1, 100000000);
                    _currentUsers.Add(new TempLog() { mTemporaryID = tunnus, mUser = passwd.mUser, mLogTime = DateTime.Now });
                    return new Subs { mName = user.mName, mPassword = tunnus.ToString(), mUser = user.mUser };
                }
            }
            catch (Exception e) 
            {
                throw new Exception("500@Login encountered an internal server error.", e);
            }

            //Kirjautumisyritys evätään.
            throw new Exception("422@Login failed. Check your credentials and try again.");
        }

        /// <summary>
        /// Tällä funktiolla kirjaudutaan ulos.
        /// </summary>
        /// <param name="passwd"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("Logout")]
#else
        [HttpPost]
        [Route("api/Pictures/Logout")]
#endif
        public void Logout([FromBody] TempLog passwd)
        {

            try
            {

                //Katsotaan löytyykö käyttäjää, jonka nimi ja salasana täsmäävät
                TempLog user = _currentUsers.FirstOrDefault(q => (q.mUser == passwd.mUser && q.mTemporaryID == passwd.mTemporaryID));
                if (user != null)
                {

                    //Jos käyttäjä on olemassa, poistetaan sen loggaus.
                    _currentUsers.Remove(user);
                    return;
                }
            }
            catch (Exception e)
            {
                throw new Exception("500@Logout encountered an internal server error", e);
            }

            //Kirjautumisyritys evätään.
            throw new Exception("422@Logout failed. Couldn't log you out.");
        }

        /// <summary>
        /// Tällä funktiolla luodaan uusi käyttäjä
        /// </summary>
        /// <param name="passwd"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("Subscribe")]
#else
        [HttpPost]
        [Route("api/Pictures/Subscribe")]
#endif
        public int Subscribe([FromBody] Subs passwd)
        {

            try
            {

                //Katsotaan onko kyseinen käyttäjänimi sopiva
                List<User> user = _context.dbUsers.Where(q => q.mUser == passwd.mUser).ToList();
                if (user.Count == 0 && !passwd.mUser.Contains("##"))
                {

                    //Jos käyttäjänimi on vapaa, luodaan uusi käyttäjä tietokantaan...
                    User temp = new User() { mUser = passwd.mUser, mPassword = passwd.mPassword,
                                             mName = passwd.mName };
                    _context.dbUsers.Add(temp);
                    _context.SaveChanges();

                    //...ja annetaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
                    int tunnus = new Random().Next(1, 100000000);   
                    _currentUsers.Add(new TempLog { mTemporaryID = tunnus, mUser = passwd.mUser, mLogTime = DateTime.Now });
                    return tunnus;
                }
            }
            catch (Exception e)
            {
                throw new Exception("500@Subscribe encountered an internal server error.", e);
            }

            //Uuden käyttäjän luonti epäonnistui.
            throw new Exception("403@You gave a username which is either already in use or you typed ##. Please give a new username.");
        }
    
        /// <summary>
        /// Tätä funktiota kutsutaan frontendin nappuloiden määrittämiseksi. Palauttaa
        /// ajantasaisen nappulalistan.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("GetSets")]
#else
        [HttpPost]
        [Route("api/Pictures/GetSets")]
#endif
        
        public IEnumerable<Button> Get([FromBody] int id)
        {
            try
            {
                
                // Katsotaan, onko käyttäjä olemassa.
                if (!CanIPass(id))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }
                TempLog usr = _currentUsers.Find(q => q.mTemporaryID == id);
                return GetButtons(_context.dbUsers.Single(e => e.mUser==usr.mUser));
            }
            catch (Exception e)
            {
                throw new Exception("500@Get encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla alustetaan tietokanta
        /// </summary>
        /// <param name="_context"></param>
        public static void Initialize(PictureDatabase _context)
        {
            _context.Database.EnsureCreated();

            if (_context.dbPictureSets.Any()) return;
            /*
            //Alla oleva on testausta varten

            List<User> us = new List<User>()
            {
                new User() { mUser = "userMikael", mName = "Mikael", mPassword = "passMikael" },
                new User() { mUser = "userSimo", mName = "Simo", mPassword = "passSimo" }

            };

            try
            {
                _context.dbUsers.AddRange(us);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<PictureSet> ps = new List<PictureSet>()
            {
                new PictureSet() { mPictureSet = "Synttärit", mUserId = us.Single(e => e.mName=="Mikael").UserId },
                new PictureSet() { mPictureSet = "Valmistujaiset", mUserId = us.Single(e => e.mName=="Mikael").UserId },
                new PictureSet() { mPictureSet = "Kreikan matka", mUserId = us.Single(e => e.mName=="Simo").UserId }
            };

            try
            {
                _context.dbPictureSets.AddRange(ps);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<Picture> pi = new List<Picture>()
            {
                new Picture() { mUserId = us.Single(e => e.mName=="Mikael").UserId, mLegend = "Valmistujaiset1", mPictureSet = "Valmistujaiset", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184255/samples/animals/three-dogs.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Mikael").UserId, mLegend = "Valmistujaiset2", mPictureSet = "Valmistujaiset", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184243/samples/animals/reindeer.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Mikael").UserId, mLegend = "Synttärikuva1", mPictureSet = "Synttärit", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/pot-mussels.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Mikael").UserId, mLegend = "Synttärikuva2", mPictureSet = "Synttärit", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184246/samples/food/fish-vegetables.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Mikael").UserId, mLegend = "Synttärikuva3", mPictureSet = "Synttärit", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184260/samples/food/spices.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Simo").UserId, mLegend = "Matkakuva1", mPictureSet = "Kreikan matka", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184257/samples/landscapes/beach-boat.jpg" },
                new Picture() { mUserId = us.Single(e => e.mName=="Simo").UserId, mLegend = "Matkakuva2", mPictureSet = "Kreikan matka", mURL = "https://res.cloudinary.com/dogdkq0ux/image/upload/v1603184261/samples/landscapes/nature-mountains.jpg" }
            };
            
            try
            {
                _context.dbPictures.AddRange(pi);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<PictureSetPicture> psp = new List<PictureSetPicture>()
            {
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Valmistujaiset").PictureSetId, 
                    mPictureId = pi.Single(e => e.mLegend=="Valmistujaiset1").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Valmistujaiset").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Valmistujaiset2").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Synttärit").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Synttärikuva1").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Synttärit").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Synttärikuva2").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Synttärit").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Synttärikuva3").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Kreikan matka").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Matkakuva1").PictureId},
                new PictureSetPicture() {mPictureSetId = ps.Single(e => e.mPictureSet=="Kreikan matka").PictureSetId,
                    mPictureId = pi.Single(e => e.mLegend=="Matkakuva2").PictureId}
            };
            
            try
            {
                _context.dbPictureSetPictures.AddRange(psp);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }

            List<AllowedUser> au = new List<AllowedUser>()
            {
                new AllowedUser() {mAllowedUser = us.Single(e => e.mName=="Mikael").mUser,
                    mOwnerUserId = us.Single(e => e.mName=="Mikael").UserId,
                    mPictureSet = ps.Single(e => e.mPictureSet=="Synttärit").mPictureSet },
                new AllowedUser() {mAllowedUser = us.Single(e => e.mName=="Mikael").mUser,
                    mOwnerUserId = us.Single(e => e.mName=="Mikael").UserId,
                    mPictureSet = ps.Single(e => e.mPictureSet=="Valmistujaiset").mPictureSet },
                new AllowedUser() {mAllowedUser = us.Single(e => e.mName=="Simo").mUser,
                    mOwnerUserId = us.Single(e => e.mName=="Simo").UserId,
                    mPictureSet = ps.Single(e => e.mPictureSet=="Kreikan matka").mPictureSet }
            };

            try
            {
                _context.dbAllowedUsers.AddRange(au);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                int koe = 0;
            }
            //Yllä oleva on testausta varten
            */
        }
 
        /// <summary>
        /// Tätä funktiota kutsutaan tietyn kuvasetin kaikkien kuvien saamiseksi. Kuvat
        /// annetaan vain, jos käyttäjällä on oikeus katsella kyseistä kuvasettiä.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("GetPictures")]
#else
        [HttpPost]
        [Route("api/Pictures/GetPictures")]
#endif

        public IEnumerable<Picture> GetAllPictures([FromBody]IntWrapper id)
        {

            try
            {

                int tempUser = id.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                // Katsotaan, onko kuvasetti olemassa.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (null == _context.dbPictureSets.Find(id.mPSID))
                {
                    throw new Exception("422@Couldn't find applied pictureset.");
                }

                // Katsotaan, onko käyttäjällä oikeutta katsella tätä kuvasettiä.
                PictureSet ps = _context.dbPictureSets.Single(c => c.PictureSetId == id.mPSID);
                AllowedUser allow = _context.dbAllowedUsers.FirstOrDefault(
                    e => (e.mAllowedUser == user.mUser || e.mAllowedUser == "##ALL##") 
                         && e.mPictureSet == ps.mPictureSet);
                if (allow == null)
                {

                    //Käyttäjällä ei ole oikeutta katsella kuvia, mutta välitetään
                    //tieto hänen halustaan kuvasetin omistajan luettavaksi, jollei hän ole
                    //jo tehnyt tätä.
                    int applicantUserId = _context.dbUsers.Single(g => g.mUser == user.mUser).UserId;
                    int ownerUserId = _context.dbPictureSets.Single(g => g.PictureSetId == id.mPSID).mUserId;
                    if (null != _context.dbAppliedRights.FirstOrDefault(
                             e => e.mApplicantUserId == applicantUserId && e.mOwnerUserId == ownerUserId
                             && e.mPictureSetId == id.mPSID))
                    {
                        List<Picture> e = new List<Picture>();
                        return e; 
                    }

                    //Ei ole tehnyt, joten tehdään nyt
                    AppliedRight ask = new AppliedRight()
                    {
                        mApplicantUserId = applicantUserId,
                        mOwnerUserId = ownerUserId,
                        mPictureSetId = id.mPSID
                    };
                    _context.dbAppliedRights.Add(ask);
                    _context.SaveChanges();

                    //Sitten poistutaan tästä funktiosta.
                    List<Picture> p = new List<Picture>();
                    return p;
                }

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                PictureSet picSet = _context.dbPictureSets.Find(id.mPSID);
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                throw new Exception("500@GetAllPictures encountered an internal server error.", e);
            }

        }



        /// <summary>
        /// Tällä funktiolla lisätään kuvakokoelma tietokantaan. Kuvakokoelma ei välttämättä
        /// sisällä viittauksia kuviin, vaan kyseessä voi olla tyhjä kuvakokoelma, johon
        /// myöhemmin lisätään kuvia. Jos kuvakokoelmassa on viittauksia kuviin, kuvien pitää
        /// olla valmiiksi tietokannassa, jotta viittaukset lisättäisiin tietokantaan. Kuvakokoelma 
        /// voi myös sisältää käyttöoikeuksien määrittelyitä.
        ///
        /// Tämä funktio on itse asiassa kaksoiskäyttöfunktio: tällä lisätää kuvakokoelma tietokantaan,
        /// jos sen nimistä kuvakokoelmaa ei käyttäjällä vielä ole. Mutta jos kuvakokoelma on jo
        /// olemassa, tällä funktiolla voidaan muuttaa olemassa olevan kuvakokoelman ominaisuuksia:
        /// joko lisätä kuvia (mutta ei vähentää) tai muuttaa käyttöoikeuksia (lisätä tai poistaa).
        /// </summary>
        /// <param name="set"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("AddPictureset")]
#else
        [HttpPost]
        [Route("api/Pictures/AddPictureset")]
#endif
        public IEnumerable<Button> AddSet([FromBody]PictureSetWrapper set)
        {
            try
            {
                PictureSet picSet = set.cPictureSet;
                int tempUser = set.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Luodaan kuvasetti.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                CreatePictureSet(picSet, user);

                //Luonnin operaation jälkeen annetaan frontendille päivitetty nappulalista.
                return GetButtons(_context.dbUsers.Single(e => e.mUser==user.mUser));

            }
            catch (Exception e)
            {
                throw new Exception("500@AddPictureset encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla poistetaan kuvakokoelma tietokannasta. Samalla poistetaan tietokannasta
        /// ne kuvat, joista on viittauksia vain tähän kuvasettiin.
        /// </summary>
        /// <param name="set"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("RemovePictureset")]
#else
        [HttpPost]
        [Route("api/Pictures/RemovePictureset")]
#endif
        public IEnumerable<Button> RemoveSet([FromBody] PictureSetWrapper set)
        {
            try
            {
                PictureSet picSet = set.cPictureSet;
                int tempUser = set.mKey;

                // Katsotaan, onko sessio olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Katsotaan, onko käyttäjällä olemassa poistettava kuvakokoelma.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                int userId = _context.dbUsers.Single(c => c.mUser == user.mUser).UserId;

                
                if (picSet != null && picSet.mPictureSet != null)
                {

                    //Jos annettu kuvasetin nimi
                    picSet = _context.dbPictureSets.Single(
                        e => e.mPictureSet == picSet.mPictureSet && e.mUserId == userId);
                }
                else
                {

                    //Jos annettu kuvasetin id
                    if (picSet != null && picSet.mUserId > 0) {
                        picSet = _context.dbPictureSets.Find(picSet.mUserId);

                        //Varmistetaan, että saatu kuvasetti kuuluu tälle käyttäjälle
                        if (picSet != null)
                        {
                            if (picSet.mUserId != userId)
                            {
                                picSet = null;
                            }
                        }
                    }
                    else
                    {
                        picSet = null;
                    }
                }

                if (null == picSet)
                {
                   throw new Exception("422@Couldn't remove asked picture set.");
                }

                //Poistetaan kuvataulusta kaikki kuvat, jotka esiintyvät vain tässä kuvakokoelmassa
                foreach (var pic in _context.dbPictures.Where(e => e.mUserId == userId).ToList())
                {
                    if (_context.dbPictureSetPictures.Where(
                        c => c.mPictureSetId == picSet.PictureSetId && c.mPictureId == pic.PictureId).Count()
                        == _context.dbPictureSetPictures.Where(
                        c => c.mPictureId == pic.PictureId).Count())
                    {
                        _context.dbPictures.Remove(pic);
                        _context.SaveChanges();
                    }
                }

                //Poistetaan referenssitaulusta kaikki kyseisen kuvakokoelman rivit.
                foreach (var psp in _context.dbPictureSetPictures.Where(
                    c => c.mPictureSetId==picSet.PictureSetId).ToList())
                {
                    _context.dbPictureSetPictures.Remove(psp);
                    _context.SaveChanges();
                } 

                //Poistetaan itse kuvasetti.
                _context.dbPictureSets.Remove(picSet);
                _context.SaveChanges();

                //Poiston jälkeen annetaan frontendille päivitetty nappulalista.
                return GetButtons(_context.dbUsers.Single(e => e.mUser == user.mUser));
            } 
            catch (Exception e)
            {
                throw new Exception("500@RemoveSet encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla tallennetaan yhden kuvan kuvadata Cloudinaryyn.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("SaveDat")]
        [Route("api/Pictures/SaveData/{id:int:min(1)}")]
#else
        [HttpPost]
        [Route("api/Pictures/SaveData/{id:int:min(1)}")]
        [Produces("application/json")]
#endif
        public JsonResult SaveData(int id, [FromBody] byte[] obj)
        {
            try
            {
                int tempUser = id;

                // Katsotaan, onko käyttäjä olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Käyttäjä on olemassa, yritetään ladata kuva Cloudinaryyn.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                string publicId = CloudinaryController.UploadToCloudinary(obj, user.mUser);
                if (publicId != null)
                {

                    //Lataus onnistui. Palautetaan kuvan url-osoite frontendiin ja 
                    //otetaan publicId väliaikaiseen talteen.
                    Picture pic = new Picture()
                    {
                        cPictureSets = null,
                        mLegend = null,
                        mPictureSet = null,
                        mURL = publicId,
                        mUserId = 0,
                        PictureId = 0
                    };
                    _publicIds.Add(publicId);
                    return Json(pic);
                }
                throw new Exception("422@Cloudinary failed. Picture data lost.");
            } 
            catch (Exception e)
            {
                throw new Exception("500@SaveData encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla tallennetaan yksi kuva tietokantaan kyseisen käyttäjän tilille haluttuun 
        /// kuvasettiin. Jos haluttua kuvasettiä ei vielä ole olemassa, se luodaan.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("SavePic")]
#else
        [HttpPost]
        [Route("api/Pictures/SavePicture")]
#endif
        
        public IEnumerable<Picture> SavePicture([FromBody]PictureWrapper obj)
        {

            try
            {
                int tempUser = obj.mKey;

                // Katsotaan, onko sessio olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Katsotaan, että kuva ja kuvasetti ovat kunnossa.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                Picture pic = obj.mPicture;
                pic.cPictureSets = null;
                string picSetName = pic.mPictureSet;
                if (pic == null || picSetName == null)
                {
                    throw new Exception("403@Forbidden. You didn't give valid picture data.");
                }
                PictureSet picSet = _context.dbPictureSets.FirstOrDefault(q => q.mPictureSet == picSetName);
                int userId = _context.dbUsers.First(o => o.mUser == user.mUser).UserId;
                if (picSet != null && picSet.mUserId != userId)
                {
                    throw new Exception("403@Forbidden. You're trying to use a reserved picture set name.");
                }
                pic.mUserId = userId;

                //Tarkastetaan, löytyykö kuva tilapäislistasta _publicIds.
                int index = _publicIds.IndexOf(pic.mURL);
                if (index != -1)
                {

                    //Poistetaan kyseinen indeksi tilapäislistasta.
                    _publicIds.RemoveAt(index);

                    //Haetaan kuvan url Cloudinarysta.
                    GetResourceResult temp = CloudinaryController.FindFromCloudinary(pic.mURL);
                    if (temp != null)
                    {

                        //Löyty Cloudinarysta
                        pic.mURL = temp.Url;
                        pic.mPublicId = temp.PublicId;
                    }
                    else
                    {
                        pic.mPublicId = null;
                    }
                }
                else
                {
                    pic.mPublicId = null;
                }
                int picSetId = 0;

                //Tallennetaan uusi kuva tietokantaan.    
                _context.dbPictures.Add(pic);
                _context.SaveChanges();

                //Jos halutun nimistä kuvasettiä ei ole olemassa, se pitää luoda.
                if (picSet == null)
                {
                    picSet = new PictureSet()
                    {
                        mPictureSet = picSetName,
                        mUserId = userId,
                        cAllowedUsers = null,
                        cPictures = new List<PictureSetPicture>()
                        {
                            new PictureSetPicture() { mPictureId = pic.PictureId }
                        }
                    };
                    picSetId = CreatePictureSet(picSet, user);
                }
                else
                {
                    picSetId = picSet.PictureSetId;
                }

                //Kuvan yhteys kuvasettiin pitää kirjata referenssitauluun.
                PictureSetPicture psp = new PictureSetPicture()
                {
                    mPictureSetId = picSetId,
                    mPictureId = pic.PictureId
                };
                _context.dbPictureSetPictures.Add(psp);
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                throw new Exception("500@SavePicture encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla poistetaan yksi kuva käyttäjän valitsemasta kuvasetistä, mutta itse 
        /// kuvaa ei poisteta tietokannasta, jos kuva esiintyy jossain toisessa kuvasetissä.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("Remove")]
#else
        [HttpPost]
        [Route("api/Pictures/RemovePicture")]
#endif

        public IEnumerable<Picture> RemovePicture([FromBody] PictureWrapper obj)
        {

            try
            {

                int tempUser = obj.mKey;

                // Katsotaan, onko sessio olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                string picSetName = obj.mPicture.mPictureSet;
                int userId = _context.dbUsers.First(q => user.mUser == q.mUser).UserId;
                PictureSet picSet = null;
                int pictureId = 0;
                picSet = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == userId));

                //Etsitään kuvaa avaimen avulla...
                Picture pic = obj.mPicture;
                pic = _context.dbPictures.FirstOrDefault(q => q.PictureId==pic.PictureId);
                if (pic == null || pic.mUserId != userId || pic.mPictureSet != picSetName)
                {

                    //Avaimella ei saatu oikeaa kuvaa. Yritetään hakea URL osoitteella...
                    pic = obj.mPicture;
                    pictureId = _context.dbPictures.FirstOrDefault(q => q.mURL == pic.mURL).PictureId;
                }
                else
                {

                    //Avaimella saatiin oikea kuva
                    pictureId = pic.PictureId;
                }

                //Jos kyseinen kuvasetti ja kuva ovat olemassa...
                if (picSet != null && pictureId != 0)
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa referenssitaulussa.
                    PictureSetPicture p = _context.dbPictureSetPictures.FirstOrDefault(
                        q => (q.mPictureId == pictureId && q.mPictureSetId == picSet.PictureSetId));
                    if (p != null)
                    {

                        //Poistetaan kyseinen rivi referenssitaulusta.
                        _context.dbPictureSetPictures.Remove(p);
                        _context.SaveChanges();

                        //Katsotaan, löytyykö kuva jostain muusta kuvasetistä.
                        List<PictureSetPicture> temp = _context.dbPictureSetPictures.Where(
                            e => e.mPictureId == pictureId).ToList();

                        //Jos ei, tuhotaan kuva.
                        if (temp.Count == 0)
                        {
                            if (pic.mPublicId != null)
                            {

                                //Jos kuva on Cloudinaryssa, tuhotaan se sieltäkin.
                                CloudinaryController.RemoveFromCloudinary(pic.mPublicId);
                            }
                            _context.dbPictures.Remove(pic);
                        }
                    }

                }
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, pois lukien äsken poistettu, listaan.
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                throw new Exception("500@RemovePicture encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla tuhotaan yksi kuva tietokannasta ja poistetaan se kaikista kuvaseteistä,
        /// missä se on olemassa.
        /// </summary>
        /// <param name="obj"></param>
#if USESWAGGER
        [HttpPost("Delete")]
#else
        [HttpPost]
        [Route("api/Pictures/DeletePicture")]
#endif

        public void DeletePicture([FromBody] PictureWrapper obj)
        {
            try
            {
                int tempUser = obj.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                // Katsotaan, onko kuva olemassa kyseisellä käyttäjällä ja annetulla URL:lla.
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                Picture pic = obj.mPicture;
                int userId = _context.dbUsers.Single(q => user.mUser == q.mUser).UserId;
                List<Picture> pics = _context.dbPictures.Where(e => e.mUserId == userId).ToList();
                pic = pics.Single(e => e.mURL==pic.mURL);
                if (pic == null)
                {
                    throw new Exception("422@Coudn't delete the picture, because it doesn't exist in a database");
                }

                // Käydään läpi referenssitaulukon kaikki rivit ja poistetaan ne, joilla
                // esiintyy kyseinen kuva
                foreach (var psp in _context.dbPictureSetPictures.Where(
                    e => e.mPictureId == pic.PictureId).ToList())
                {
                    _context.dbPictureSetPictures.Remove(psp);
                }
                _context.SaveChanges();

                // Lopuksi poistetaan itse kuva kuvataulukosta.
                if (pic.mPublicId != null)
                {

                    //Jos kuva on Cloudinaryssa, tuhotaan se sieltäkin.
                    CloudinaryController.RemoveFromCloudinary(pic.mPublicId);
                }
                _context.dbPictures.Remove(pic);
                _context.SaveChanges();

            }
            catch (Exception e)
            {
                throw new Exception("500@DeletePicture encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla voi frontend tiedustella, onko kyseiselle käyttäjälle
        /// saapunut toisilta käyttäjiltä pyyntöjä päästä katselemaan joitakin 
        /// hänen omistamiaan kuvasettejä. Jos kuvasetin omistaja päättää antaa 
        /// jollekin oikeuden katsella jotakin hänen kuvasettiään, tämä oikeus 
        /// saadaan tallennettua tietokantaan käyttämällä AddPictureSet funktiota.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("GetApplications")]
#else
        [HttpPost]
        [Route("api/Pictures/GetApplications")]
#endif
        public IEnumerable<Application> GetApplications([FromBody] int id)
        {
            try
            {
                int tempUser = id;
                List<Application> rights = new List<Application>();

                //Katsotaan, onko sessio olemassa
                if (!CanIPass(tempUser))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Haetaan tälle käyttäjälle osoitetut hakemukset
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                int userId = _context.dbUsers.Single(s => s.mUser == user.mUser).UserId;
                foreach (var hak in _context.dbAppliedRights.Where(
                    s => s.mOwnerUserId == userId).ToList())
                {
                    Application app = new Application();
                    User usr = _context.dbUsers.Single(d => d.UserId == hak.mApplicantUserId);
                    app.mApplicantUser = usr.mUser;
                    app.mApplicantName = usr.mName;
                    app.mPictureSet = _context.dbPictureSets.Single(
                        e => e.PictureSetId == hak.mPictureSetId).mPictureSet;
                    rights.Add(app);
                }

                return rights;
            } 
            catch (Exception e)
            {
                throw new Exception("500@GetApplications encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä funktiolla voi frontend pyytää kaikki yhden käyttäjän kaikilla
        /// kuvaseteillä voimassa olevat käyttöluvat.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("GetAlloweds")]
#else
        [HttpPost]
        [Route("api/Pictures/GetAlloweds")]
#endif
        public IEnumerable<Application> GetAlloweds([FromBody] int id)
        {
            try
            {
                List<Application> rights = new List<Application>();

                // Katsotaan, onko sessio olemassa.
                if (!CanIPass(id))
                {
                    throw new Exception("403@Forbidden. Please try to log in again.");
                }

                //Haetaan tämän käyttäjän myöntämät käyttöluvat
                TempLog user = _currentUsers.Find(q => q.mTemporaryID == id);
                int userId = _context.dbUsers.Single(s => s.mUser == user.mUser).UserId;
                foreach (var hak in _context.dbAllowedUsers.Where(
                    s => s.mOwnerUserId == userId).ToList())
                {
                    Application app = new Application();
                    User usr = _context.dbUsers.Single(d => d.mUser == hak.mAllowedUser);
                    app.mApplicantUser = usr.mUser;
                    app.mApplicantName = usr.mName;
                    app.mPictureSet = hak.mPictureSet;
                    rights.Add(app);
                }

                return rights;
            } 
            catch (Exception e)
            {
                throw new Exception("500@GetAlloweds encountered an internal server error.", e);
            }
        }

        /// <summary>
        /// Tällä apufunktiolla luodaan lista yhden kuvasetin kuvista.
        /// </summary>
        /// <returns></returns>
        private List<Picture> GetPictures(PictureSet picSet)
        {
            List<Picture> pictures = new List<Picture>();

            List<PictureSetPicture> pics = _context.dbPictureSetPictures.Where
                (e => e.mPictureSetId == picSet.PictureSetId).ToList();
            foreach (var psp in pics)
            {
                Picture temp = _context.dbPictures.Find(psp.mPictureId);
                temp.cPictureSets = null;
                temp.mUserId = 0;
                temp.mPictureSet = picSet.mPictureSet;
                pictures.Add(temp);
            }

            return pictures;
        }

        /// <summary>
        /// Tällä apufunktiolla luodaan lista nappuloista, jotka frontendin pitää tarjota
        /// käyttäjälle. Kaikki tietokannan sisältämät kuvakokoelmat saavat oman nappulan,
        /// mutta käyttöoikeuksista riippuen nappulan mAccessible ominaisuus on joko 1,
        /// jolloin kuvakokoelma on käytettävissä, tai 2, jolloin kuvakokoelmaa ei voida
        /// näyttää käyttäjälle.
        /// </summary>
        /// <returns></returns>
        private IEnumerable<Button> GetButtons(User currentUser)
        {

            List<Button> buttons = new List<Button>();

            int userId = _context.dbUsers.Single(s => s.mUser == currentUser.mUser).UserId;
            foreach (var user in _context.dbUsers.ToList())
            {

                    //Tämä rivi lisää nappuloiden listaan käyttäjän ylänappulan.
                    buttons.Add(new Button() { mName = user.mName, mPSID = 0, mPictureSet = user.mUser });

                    List<PictureSet> psets = _context.dbPictureSets.Where(q => q.mUserId == user.UserId).ToList();
                    foreach (var pset in psets.ToList())
                    {
                        var button = new Button();
                        button.mName = user.mName;
                        button.mPictureSet = pset.mPictureSet;
                        button.mPSID = pset.PictureSetId;
                        int count = _context.dbAllowedUsers.Where(
                            e => (e.mAllowedUser == currentUser.mUser || e.mAllowedUser == "##ALL##")
                            && e.mPictureSet == pset.mPictureSet).Count();
                        if (count < 1)
                        {

                            //Tätä kuvasettiä ei ole annettu tämän käyttäjän katseltavaksi.
                            button.mAccessible = 0;
                        }
                        else
                        {

                            //Tällä käyttäjällä on käyttöoikeus tähän kuvasettiin.
                            button.mAccessible = 1;
                        }

                        buttons.Add(button);
                    }
            }
            return buttons;
        }

        /// <summary>
        /// Tällä apufunktiolla luodaan tietokantaan kuvakokoelma, jollei sen nimistä ole
        /// valmiiksi olemassa, jolloin lisätään vain viittaukset ja oikeudet. Mahdollisissa luotavan
        /// kuvakokoelman sisältämissä viittauksissa kuviin huomioon otetaan vain kunkin
        /// kuvan avain, mutta ei viittauksessa mahdollisesti annettavaa kuvakokoelmaa, sillä 
        /// sen on oltava sama kuin luotavan kuvakokoelman. Mahdolliset kuvakokoelman
        /// sisältämät käyttöoikeudet tallennetaan myös tietokantaan: Käyttöoikeuksissa huomoitavaa 
        /// on se, että jos kuvakokoelma sisältämät käyttöoikeudet sisältävät käyttöoikeuden
        /// käyttäjälle, jonka mAllowedUser on '##ALL##', kuvasetti tulee kaikkien käyttäjien nähtäville. 
        /// Tällöin kaikki erilliset käyttöoikeudet poistetaan tietokannasta kyseisen kuvasetin osalta.
        /// Jos taas käyttöoikeudet sisältävät käyttäjän, jonka mAllowedUser on '##REMOVE##', kuvasetin 
        /// käyttöoikeus poistetaan listauksessa olevilta muilta käyttäjiltä.
        /// </summary>
        /// <param name="picSet"></param>
        private int CreatePictureSet(PictureSet picSet, TempLog user)
        {
            PictureSet temp = picSet;

            //Ensin lisätään kuvakokoelma tietokantaan, jollei saman nimistä ole jo olemassa
            if (null == _context.dbPictureSets.FirstOrDefault(e => e.mPictureSet == temp.mPictureSet))
            { 
                temp.cAllowedUsers = null;
                temp.cPictures = null;
                temp.User = _context.dbUsers.First(e => e.mUser == user.mUser);
                temp.mUserId = temp.User.UserId;
                _context.dbPictureSets.Add(temp);
                _context.SaveChanges();
            }

            //Sitten katsotaan, onko kuvakokoelmaan sisällytetty kuvien viittauksia, ja jos on, 
            //lisätään niiden viittaukset tähän kovakokoelmaan, jos sellaiset kuvat ovat 
            //valmiiksi tallennetut tietokantaan tämän käyttäjän omistamiksi.
            if (picSet.cPictures != null)
            {
                foreach (var pic in picSet.cPictures)
                {

                    Picture p = _context.dbPictures.Find(pic.mPictureId);
                    if (null != p && p.mUserId == temp.mUserId)
                    {

                        //Emme anna käyttäjän määritellä mihin kuvakokoelmaan kuva liitetään...
                        pic.mPictureSetId = temp.PictureSetId;
                        _context.dbPictureSetPictures.Add(pic);
                        _context.SaveChanges();
                    }
                }
            }

            //Lopuksi katsotaan, haluaako käyttäjä antaa joillekin käyttäjille oikeuden 
            //katsella tätä kuvakokoelmaa -tai poistaa oikeuksia. Otetaan tämä sama
            //kuvasetti tietokannasta, jotta sillä on toimiva avain:
            PictureSet ps = _context.dbPictureSets.Single(e => e.mPictureSet == picSet.mPictureSet);
            if (picSet.cAllowedUsers != null)
            {
                int flag = 0;

                foreach (var allo in picSet.cAllowedUsers)
                {

                    //Käyttäjä haluaa kaikkien muiden käyttäjien voivan katsella tätä kuvasettiä.
                    if ("##ALL##" == allo.mAllowedUser) flag = 1;

                    //Käyttäjä haluaa poistaa kuvasetin katseluoikeuden luettelemiltaan käyttäjiltä.
                    if ("##REMOVE##" == allo.mAllowedUser) flag = 2;
                }

                switch (flag)
                {
                    case 0:
                        {

                            //Tässä vaihtoehdossa lisätään käyttöoikeuksia listan mukaisesti.
                            foreach (var allo in picSet.cAllowedUsers)
                            {
                                User usr = _context.dbUsers.FirstOrDefault(e => e.mUser == allo.mAllowedUser);
                                if (null != usr)
                                {

                                    //Lisätään uusi katseluoikeus.
                                    _context.dbAllowedUsers.Add(new AllowedUser()
                                    {
                                        mOwnerUserId = _context.dbUsers.FirstOrDefault(e => e.mUser == user.mUser).UserId,
                                        mAllowedUser = allo.mAllowedUser,
                                        mPictureSet = ps.mPictureSet
                                    });

                                    //Poistetaan mahdollinen vastaava pyyntö katseluoikeuteen.
                                    AppliedRight ask = _context.dbAppliedRights.FirstOrDefault(
                                        s => s.mApplicantUserId == usr.UserId &&
                                        s.mPictureSetId == ps.PictureSetId &&
                                        s.mOwnerUserId == temp.mUserId);
                                    if (ask != null)
                                    {
                                        _context.dbAppliedRights.Remove(ask);
                                    }
                                    _context.SaveChanges();
                                }
                            }
                            break;
                        }

                    case 1:
                        {

                            //Tässä vaihtoehdossa annetaan kaikille käyttäjille käyttöoikeus,
                            //mutta ensin poistetaan tietokannasta kaikki tähän kuvasettiin
                            //liittyvät käyttöoikeudet
                            foreach (var allo in _context.dbAllowedUsers.Where(
                                s => s.mPictureSet == temp.mPictureSet).ToList())
                            {
                                _context.dbAllowedUsers.Remove(allo);
                            }

                            //Lisätään uusi katseluoikeus.
                            _context.dbAllowedUsers.Add(new AllowedUser()
                            {
                                mOwnerUserId = _context.dbUsers.FirstOrDefault(e => e.mUser == user.mUser).UserId,
                                mAllowedUser = "##ALL##",
                                mPictureSet = ps.mPictureSet
                            });
                            _context.SaveChanges();
                            break;
                        }

                    case 2:
                        {

                            //Tässä vaihtoehdossa poistetaan listatut käyttöoikeudet
                            foreach (var allo in picSet.cAllowedUsers)
                            {
          
                                //Poistetaan katseluoikeus.
                                AllowedUser usr = _context.dbAllowedUsers.FirstOrDefault(
                                        s => s.mPictureSet == ps.mPictureSet && s.mAllowedUser == allo.mAllowedUser);
                                _context.dbAllowedUsers.Remove(usr);
                                _context.SaveChanges();
                            }
                            break;
                        }
                }
                
            }

            //Itselleen käyttäjän on joka tapauksessa annettava oikeus katsoa omia kuviaan.
            _context.dbAllowedUsers.Add(new AllowedUser()
            {
                mOwnerUserId = _context.dbUsers.FirstOrDefault(e => e.mUser == user.mUser).UserId,
                mAllowedUser = user.mUser,
                mPictureSet = ps.mPictureSet
            });
            _context.SaveChanges();

            //lopuksi palautetaan luodun kuvasetin avain
            return ps.PictureSetId;
        }

        /// <summary>
        /// Tällä funktiolla tarkastetaan, onko frontin sessio voimassa.
        /// </summary>
        /// <param name="tempUser"></param>
        /// <returns></returns>
        private bool CanIPass(int tempUser)
        {
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null || user.mLogTime.AddHours(1) < DateTime.Now)
            {
                return false;
            }
            else
            {
                user.mLogTime = DateTime.Now;
                return true;
            }
        }

    }
}

