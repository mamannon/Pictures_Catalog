
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
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Picture_Catalog.Controllers
{

    public class PictureServerController : ControllerBase
    {

        private readonly PictureDatabase _context;
        private static List<TempLog> _currentUsers = new List<TempLog>();

        public class LogIn
        {
            public string mUser { get; set; }
            public string mPassword { get; set; }
        }

        public class TempLog
        {
            public string mUser { get; set; }
            public int mTemporaryID { get; set; }
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
            public PictureSet mPictureSet { get; set; }
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
        public int Login([FromBody] LogIn passwd)
        {

            try
            {

                //Katsotaan löytyykö käyttäjää, jonka nimi ja salasana täsmäävät
                User user = _context.dbUsers.FirstOrDefault(q => (q.mUser == passwd.mUser && q.mPassword == passwd.mPassword));
                if (user != null && passwd.mPassword != null && passwd.mUser != null)
                {

                    //Jos käyttäjä on olemassa, luodaan sille tilapäinen käyttäjätunnus tätä loginsessiota varten.
                    int tunnus = new Random().Next(1, 100000000);
                    _currentUsers.Add(new TempLog() { mTemporaryID = tunnus, mUser = passwd.mUser });
                    return tunnus;
                }
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return 0;
            }

            //Kirjautumisyritys evätään.
            Response.StatusCode = 422;
            return 0;
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
                Response.StatusCode = 500;
                return;
            }

            //Kirjautumisyritys evätään.
            Response.StatusCode = 422;
            return;
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
        [Route("api/Pictures/Login")]
#endif
        public int Subscribe([FromBody] Subs passwd)
        {

            try
            {

                //Katsotaan onko kyseinen käyttäjänimi sopiva
                List<User> user = _context.dbUsers.Where(q => q.mUser == passwd.mUser).ToList();
                if (user.Count() == 0 && !passwd.mUser.Contains("##"))
                {

                    //Jos käyttäjänimi on vapaa, luodaan uusi käyttäjä tietokantaan...
                    User temp = new User()
                    {
                        mUser = passwd.mUser,
                        mPassword = passwd.mPassword,
                        mName = passwd.mName
                    };
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
                Response.StatusCode = 500;
                return 0;
            }

            //Uuden käyttäjän luonti epäonnistui.
            Response.StatusCode = 422;
            return 0;
        }

        /// <summary>
        /// Tätä funktiota kutsutaan frontendin nappuloiden määrittämiseksi. Palauttaa
        /// ajantasaisen nappulalistan.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpGet("GetSets")]
#else
        [HttpGet]
        [Route("api/Pictures/GetSets/{id}")]
#endif

        public IEnumerable<Button> Get(int id)
        {
            try
            {
                int tempUser = id;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog usr = null;
                usr = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (usr == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }

                return GetButtons(_context.dbUsers.Single(e => e.mUser == usr.mUser));
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
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

        public IEnumerable<Picture> GetAllPictures([FromBody] IntWrapper id)
        {

            try
            {

                int tempUser = id.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }

                // Katsotaan, onko kuvasetti olemassa.
                if (null == _context.dbPictureSets.Find(id.mPSID)) return null;

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
                        && e.mPictureSetId == id.mPSID)) return null;

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
                    return null;
                }

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                PictureSet picSet = _context.dbPictureSets.Find(id.mPSID);
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
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
        public IEnumerable<Button> AddSet([FromBody] PictureSetWrapper set)
        {
            try
            {
                PictureSet picSet = set.mPictureSet;
                int tempUser = set.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }

                //Luodaan kuvasetti.
                CreatePictureSet(picSet, user);

                //Luonnin operaation jälkeen annetaan frontendille päivitetty nappulalista.
                return GetButtons(_context.dbUsers.Single(e => e.mUser == user.mUser));

            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
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
                PictureSet picSet = set.mPictureSet;
                int tempUser = set.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }

                //Katsotaan, onko käyttäjällä olemassa poistettava kuvakokoelma.
                int userId = _context.dbUsers.Single(c => c.mUser == user.mUser).UserId;
                picSet = _context.dbPictureSets.Single(
                    e => e.mPictureSet == picSet.mPictureSet && e.mUserId == userId);
                if (null == picSet)
                {
                    Response.StatusCode = 422;
                    return null;
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
                    }
                }
                _context.SaveChanges();

                //Poistetaan referenssitaulusta kaikki kyseisen kuvakokoelman rivit.
                foreach (var psp in _context.dbPictureSetPictures.Where(
                    c => c.mPictureSetId == picSet.PictureSetId).ToList())
                {
                    _context.dbPictureSetPictures.Remove(psp);
                }
                _context.SaveChanges();

                //Poistetaan itse kuvasetti.
                _context.dbPictureSets.Remove(picSet);
                _context.SaveChanges();

                //Poiston jälkeen annetaan frontendille päivitetty nappulalista.
                return GetButtons(_context.dbUsers.Single(e => e.mUser == user.mUser));
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
            }
        }

        /// <summary>
        /// Tällä funktiolla tallennetaan yksi kuva tietokantaan kyseisen käyttäjän tilille haluttuun 
        /// kuvasettiin. Jos haluttua kuvasettiä ei vielä ole olemassa, se luodaan.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpPost("Save")]
#else
        [HttpPost]
        [Route("api/Pictures/SavePicture")]
#endif

        public IEnumerable<Picture> SavePicture([FromBody] PictureWrapper obj)
        {

            try
            {
                int tempUser = obj.mKey;

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }

                //Katsotaan, että kuva ja kuvasetti ovat kunnossa.
                Picture pic = obj.mPicture;
                pic.cPictureSets = null;
                string picSetName = pic.mPictureSet;
                if (pic == null || picSetName == null)
                {
                    Response.StatusCode = 422;
                    return null;
                }
                PictureSet picSet = _context.dbPictureSets.FirstOrDefault(q => q.mPictureSet == picSetName);
                int userId = _context.dbUsers.First(o => o.mUser == user.mUser).UserId;
                if (picSet != null && picSet.mUserId != userId)
                {
                    Response.StatusCode = 422;
                    return null;
                }
                pic.mUserId = userId;
                int picSetId = 0;

                //Tallennetaan uusi kuva tietokantaan.    
                _context.dbPictures.Add(pic);
                _context.SaveChanges();
                if (picSet == null)
                {

                    //Jos halutun nimistä kuvasettiä ei ole olemassa, se pitää luoda.
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

                //Kuvan yhteys kuvasettiin pitää kirjata referenssitaulukkoon.
                PictureSetPicture psp = new PictureSetPicture()
                {
                    mPictureSetId = picSetId,
                    mPictureId = pic.PictureId
                };

                //Luetaan tietokannasta kaikki kuvasetin kuvat listaan. 
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
            }
        }

        /// <summary>
        /// Tällä funktiolla poistetaan yksi kuva käyttäjän valitsemasta kuvasetistä, mutta itse kuvaa ei poisteta 
        /// tietokannasta.
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

                // Katsotaan, onko käyttäjä olemassa.
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return null;
                }


                string picSetName = obj.mPicture.mPictureSet;
                Picture pic = obj.mPicture;
                int userId = _context.dbUsers.First(q => user.mUser == q.mUser).UserId;
                PictureSet picSet = null;
                picSet = _context.dbPictureSets.First(q => (q.mPictureSet == picSetName && q.mUserId == userId));

                //Jos kyseinen kuvasetti on olemassa...
                if (picSet != null)
                {

                    //Katsotaan, onko meillä poistettavaksi haluttua kuvaa referenssitaulussa...
                    PictureSetPicture p = null;
                    p = picSet.cPictures.FirstOrDefault(q => q.mPictureId == pic.PictureId);
                    if (p != null)
                    {

                        //Poistetaan kuva annetun kuvasetin listauksesta
                        picSet.cPictures.Remove(p);
                    }

                }
                _context.SaveChanges();

                //Luetaan tietokannasta kaikki kuvasetin kuvat, pois lukien äsken poistettu, listaan
                return GetPictures(picSet);
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return null;
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
                TempLog user = null;
                user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
                if (user == null)
                {
                    Response.StatusCode = 403;
                    return;
                }

                // Katsotaan, onko kuva olemassa kyseisellä käyttäjällä ja annetulla URL:lla.
                Picture pic = obj.mPicture;
                int userId = _context.dbUsers.Single(q => user.mUser == q.mUser).UserId;
                List<Picture> pics = _context.dbPictures.Where(e => e.mUserId == userId).ToList();
                pic = pics.Single(e => e.mURL == pic.mURL);
                if (pic == null)
                {
                    Response.StatusCode = 422;
                    return;
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
                _context.dbPictures.Remove(pic);
                _context.SaveChanges();

            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                return;
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
        [HttpGet("GetApplications")]
#else
        [HttpGet]
        [Route("api/Pictures/GetApplicants")]
#endif
        public IEnumerable<Application> GetApplications(int id)
        {
            int tempUser = id;
            List<Application> rights = new List<Application>();

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null)
            {
                Response.StatusCode = 403;
                return null;
            }

            //Haetaan tälle käyttäjälle osoitetut hakemukset
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

        /// <summary>
        /// Tällä funktiolla voi frontend pyytää kaikki yhden käyttäjän kaikilla
        /// kuvaseteillä voimassa olevat käyttöluvat.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
#if USESWAGGER
        [HttpGet("GetAlloweds")]
#else
        [HttpGet]
        [Route("api/Pictures/GetAlloweds")]
#endif
        public IEnumerable<Application> GetAlloweds(int id)
        {
            int tempUser = id;
            List<Application> rights = new List<Application>();

            // Katsotaan, onko käyttäjä olemassa.
            TempLog user = null;
            user = _currentUsers.Find(q => q.mTemporaryID == tempUser);
            if (user == null)
            {
                Response.StatusCode = 403;
                return null;
            }

            //Haetaan tämän käyttäjän myöntämät käyttöluvat
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

                //Tämä rivi lisää nappuloiden listaan käyttäjän ylänappulan
                buttons.Add(new Button() { mName = user.mName, mPSID = 0 });

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
                        button.mAccessible = 0;
                    }
                    else
                    {
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
            if (null == _context.dbPictureSets.FirstOrDefault(e => e.mPictureSet == picSet.mPictureSet))
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
            //valmiiksi tallennetut tietokantaan.
            if (picSet.cPictures != null)
            {
                foreach (var pic in picSet.cPictures)
                {
                    if (null != _context.dbPictures.Find(pic.mPictureId))
                    {

                        //Emme anna käyttäjän määritellä mihin kuvakokoelmaan kuva liitetään...
                        pic.mPictureSetId = temp.PictureSetId;
                        _context.dbPictureSetPictures.Add(pic);
                    }
                }
                _context.SaveChanges();
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

    }
}

