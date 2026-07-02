export type BlogSection = {
  heading: string
  paragraphs: string[]
  listItems?: string[]
}

export type BlogPost = {
  slug: string
  seoTitle: string
  metaDescription: string
  h1: string
  date: string
  excerpt: string
  sections: BlogSection[]
}

const data = {
  "indexIntro": "Valuatumin blogi käsittelee yrityksen arvonmääritystä käytännönläheisesti ja selkokielellä: menetelmät ja niiden rajat, tyypilliset virheet omissa laskelmissa sekä tekoälyn todellinen rooli analyysissä. Kirjoitukset perustuvat Valuatumin yli 25 vuoden kokemukseen arvonmääritys- ja analyysijärjestelmistä pankeille ja analyysitaloille.",
  "posts": [
    {
      "slug": "miten-yrityksen-arvo-maaritetaan",
      "seoTitle": "Miten yrityksen arvo määritetään? Menetelmät selkokielellä",
      "metaDescription": "Substanssiarvo, DCF, EVA ja verrokkikertoimet selkokielellä: mitä kukin mittaa, milloin mikäkin sopii ja miksi yksi piste-estimaatti ei riitä yrityksen arvoksi.",
      "h1": "Miten yrityksen arvo määritetään? Menetelmät selkokielellä",
      "date": "2026-07-02",
      "excerpt": "Substanssiarvo, DCF, EVA ja verrokkikertoimet selkokielellä: mitä kukin mittaa, milloin mikäkin sopii — ja miksi luotettava arvonmääritys hylkää osan menetelmistä ja antaa välin, ei yhtä lukua.",
      "sections": [
        {
          "heading": "Miten yrityksen arvo määritetään lyhyesti?",
          "paragraphs": [
            "Yrityksen arvo määritetään kolmella päälähestymistavalla: tuottoarvolla eli tulevien kassavirtojen nykyarvolla (esimerkiksi DCF), markkinapohjaisilla verrokkikertoimilla (esimerkiksi P/E ja EV/EBITDA) sekä tasepohjaisella substanssiarvolla. Luotettava arvonmääritys käyttää useampaa menetelmää rinnakkain, perustelee myös hylätyt menetelmät ja ilmoittaa tuloksen arvostusvälinä sekä skenaarioiden odotusarvona — ei yhtenä tarkkana lukuna.",
            "Menetelmät eivät ole vaihtoehtoisia tapoja laskea samaa asiaa, vaan ne vastaavat eri kysymyksiin. Substanssiarvo kertoo, mitä yhtiön omaisuus on velkojen jälkeen. Tuottoarvo kertoo, mitä yhtiön tuleva kassavirta on tänään arvostettuna. Verrokit kertovat, mitä vastaavista yhtiöistä on maksettu. Siksi menetelmän valinta on jo itsessään väite yhtiöstä — ja väärä valinta tuottaa väärän arvon uskottavan näköisenä."
          ],
          "listItems": []
        },
        {
          "heading": "Mitä substanssiarvo kertoo yrityksen arvosta?",
          "paragraphs": [
            "Substanssiarvo on yhtiön omaisuuserien käypä arvo vähennettynä veloilla. Se vastaa kysymykseen: mitä omistajille jäisi, jos toiminta lopetettaisiin ja omaisuus myytäisiin. Laskenta lähtee taseesta, mutta kirjanpitoarvot oikaistaan käypiin arvoihin — esimerkiksi kiinteistön tasearvo voi poiketa merkittävästi markkinahinnasta.",
            "Substanssiarvo sopii holding-yhtiöille, omaisuusvaltaisille yhtiöille ja tilanteisiin, joissa tulos ei kanna arvoa: tappiolliselle yhtiölle substanssi antaa arvon lattian. Kannattavalle palvelu- tai ohjelmistoyhtiölle se on väärä menetelmä, koska arvo syntyy kassavirrasta eikä taseesta — kevyellä taseella toimiva kannattava yhtiö näyttäisi substanssilla mitattuna lähes arvottomalta."
          ],
          "listItems": []
        },
        {
          "heading": "Miten tuottoarvo ja DCF-laskelma toimivat?",
          "paragraphs": [
            "DCF eli diskontattu kassavirta ennustaa yhtiön tulevat vapaat kassavirrat ja diskonttaa ne nykyhetkeen tuottovaatimuksella, joka heijastaa sijoituksen riskiä. Ennustejakson jälkeinen aika arvostetaan päätearvolla. Tulos on tuottoarvo: mitä yhtiön tuleva kassavirta on ostajalle arvoinen tänään.",
            "DCF:n vahvuus on, että se pakottaa oletukset näkyviin: kasvu, kannattavuus, investoinnit ja tuottovaatimus on kirjoitettava auki. Sama on sen heikkous — pienet muutokset oletuksissa liikuttavat arvoa paljon, ja päätearvo muodostaa usein valtaosan koko arvosta. Siksi DCF ilman herkkyystarkastelua on vaarallinen.",
            "DCF sopii yhtiöille, joiden kassavirta on kohtuudella ennustettavissa. Se ei sovi, jos ennusteelle ei ole uskottavaa pohjaa: hyvin nuori yhtiö, yksittäisen poikkeusvuoden varassa oleva tulos tai syvästi tappiollinen liiketoiminta ilman dokumentoitua käännettä."
          ],
          "listItems": []
        },
        {
          "heading": "Mitä EVA-menetelmä mittaa?",
          "paragraphs": [
            "EVA eli taloudellinen lisäarvo mittaa tulosta, joka ylittää pääoman kustannuksen. Yhtiön arvo on sitoutunut pääoma lisättynä tulevien lisäarvojen nykyarvolla. Jos yhtiö tuottaa pääomalleen vain sen kustannuksen verran, kasvu ei luo arvoa — EVA tekee tämän näkyväksi tavalla, jota pelkkä tuloslaskelma ei näytä.",
            "Samoilla oletuksilla EVA ja DCF päätyvät samaan arvoon, mutta ne jakavat sen eri tavalla: EVA erottelee, kuinka suuri osa arvosta on jo taseessa ja kuinka suuri osa nojaa tulevaan arvonluontiin. Tämä on hyödyllinen ristitarkistus — jos valtaosa arvosta on tulevan lisäarvon varassa, oletusten on kestettävä tarkastelu."
          ],
          "listItems": []
        },
        {
          "heading": "Milloin verrokkikertoimet kuten P/E ja EV/EBITDA toimivat?",
          "paragraphs": [
            "Verrokkimenetelmä hinnoittelee yhtiön sen mukaan, mitä vastaavista yhtiöistä maksetaan: P/E suhteuttaa hinnan nettotulokseen, EV/EBITDA yritysarvon käyttökatteeseen. Menetelmä toimii, kun aidosti vertailukelpoisia yhtiöitä on olemassa ja tulos on normalisoitu kertaeristä.",
            "Verrokit menevät helposti pieleen: P/E on merkityksetön tappiolliselle yhtiölle, listattujen suuryhtiöiden kertoimet eivät sovellu pienelle listaamattomalle yhtiölle ilman koko- ja likviditeettialennuksia, ja yhden poikkeusvuoden tulos vääristää koko arvion. Tappiolliselle yhtiölle toimivampia ovat esimerkiksi kannattavuuden ja liikevaihtokertoimen suhteuttaminen toisiinsa (EBIT-% vs. P/S) tai substanssiarvo."
          ],
          "listItems": []
        },
        {
          "heading": "Mitä eroa arvonmääritysmenetelmillä on?",
          "paragraphs": [
            "Menetelmien erot tiivistettynä:"
          ],
          "listItems": [
            "Substanssiarvo — mittaa: omaisuus velkojen jälkeen · sopii: holding- ja omaisuusvaltaiset yhtiöt, tappiollisen yhtiön arvon lattia · ei sovi: kannattava kevyttaseinen yhtiö",
            "DCF (tuottoarvo) — mittaa: tulevien kassavirtojen nykyarvo · sopii: ennustettava kassavirta · ei sovi: yhtiö, jonka ennusteelle ei ole uskottavaa pohjaa",
            "EVA — mittaa: pääoman kustannuksen ylittävä tulos · sopii: DCF:n ristitarkistus ja arvonluonnin erittely · ei sovi: käytettäväksi yksin ilman kassavirta-analyysiä",
            "Verrokkikertoimet (P/E, EV/EBITDA) — mittaa: markkinahinta suhteessa tulokseen · sopii: kun vertailukelpoisia yhtiöitä on ja tulos on normalisoitu · ei sovi: tappiollinen tai poikkeusvuoden varassa oleva yhtiö"
          ]
        },
        {
          "heading": "Miksi osa menetelmistä pitää hylätä?",
          "paragraphs": [
            "Jokainen menetelmä olettaa jotain yhtiöstä. Jos oletus ei päde — P/E tappiolliselle yhtiölle, substanssi kevyttaseiselle kasvuyhtiölle — menetelmän tuottama luku ei ole varovainen arvio vaan kohinaa. Kohinan keskiarvoistaminen mielekkäiden tulosten kanssa ei paranna arviota, se laimentaa sen.",
            "Siksi laadukas arvonmääritys kertoo paitsi käytetyt menetelmät perusteluineen, myös hylätyt menetelmät ja hylkäyksen syyt. Hylkäysperustelut ovat lukijalle laadun merkki: ne osoittavat, että menetelmät on valittu yhtiön profiilin mukaan eikä kaavamaisesti."
          ],
          "listItems": []
        },
        {
          "heading": "Miksi yksi piste-estimaatti valehtelee?",
          "paragraphs": [
            "Yhtiön tuleva kehitys on epävarma, joten yksi tarkka euromäärä antaa väärän kuvan varmuudesta. Rehellisempi tapa on rakentaa skenaariot — pessimistinen, realistinen ja optimistinen — antaa kullekin todennäköisyys ja laskea odotusarvo eli todennäköisyyksillä painotettu arvo.",
            "Kuvitteellinen esimerkki: pessimistinen skenaario 0,5 M€ (30 %), realistinen 2,0 M€ (55 %) ja optimistinen 3,5 M€ (15 %). Odotusarvo on 0,30 × 0,5 + 0,55 × 2,0 + 0,15 × 3,5 = 1,8 M€ — vähemmän kuin realistisen skenaarion 2,0 M€, koska riskit painavat alaspäin. Tämän eron näkeminen on skenaarioanalyysin ydin: se kertoo, kumpaan suuntaan epävarmuus kallistaa arvoa.",
            "Sekä ostaja että myyjä hyötyvät välistä enemmän kuin yhdestä luvusta: väli näyttää, mistä oletuksesta arvo riippuu ja mistä hintaneuvottelussa todellisuudessa keskustellaan."
          ],
          "listItems": []
        },
        {
          "heading": "Mitkä ovat tyypillisimmät virheet omissa arvonmäärityslaskelmissa?",
          "paragraphs": [
            "Omatoimisissa laskelmissa toistuvat tyypillisesti samat virheet:"
          ],
          "listItems": [
            "Tulosta ei normalisoida: yksittäinen hyvä tai huono vuosi ohjaa koko arviota, vaikka kertaerät ja poikkeusvuodet pitäisi oikaista.",
            "Omistajayrittäjän palkkakorjaus unohtuu: jos omistaja nostaa markkinatasoa pienempää palkkaa, tulos yliarvioi yhtiön todellisen kannattavuuden.",
            "Nettovelka jää vähentämättä: yritysarvo (EV) ja osakekannan arvo menevät sekaisin, jolloin velkaisen yhtiön hinta yliarvioidaan.",
            "Päätearvon kasvuoletus on suurempi kuin talouden pitkän aikavälin kasvu — jolloin yhtiön oletetaan kasvavan ikuisesti taloutta nopeammin.",
            "Kertoimet poimitaan listatuista suuryhtiöistä ilman koko-, likviditeetti- ja riskialennuksia.",
            "Herkkyystarkastelu puuttuu: ei tiedetä, mikä oletus ratkaisee lopputuloksen, joten arvion haurautta ei nähdä.",
            "Kaikki menetelmät keskiarvoistetaan hylkäämättä yhtiölle sopimattomia."
          ]
        },
        {
          "heading": "Missä näitä menetelmiä voi nähdä käytännössä?",
          "paragraphs": [
            "Valuatumin AI-arvonmääritysraportti soveltaa juuri näitä menetelmiä suomalaisiin yhtiöihin: raportti kertoo käytetyt ja hylätyt menetelmät perusteluineen, laskee skenaariot todennäköisyyksineen ja odotusarvon sekä erittelee arvon ajurit ja riskit. Laadun voi tarkistaa etukäteen [ilmaisista esimerkkiraporteista](/#esimerkit) — mukana on todellinen, julkisista tiedoista laadittu [Supercell Oy:n raportti](/samples/esimerkkiraportti-supercell.pdf). Yksittäinen raportti maksaa [79 € + alv](/#hinnoittelu), ja [tilaukseen](/#tilaa) riittää yrityksen nimi tai Y-tunnus. Tekoälyn roolista arvonmäärityksessä kerromme tarkemmin kirjoituksessa [Tekoäly yrityksen arvonmäärityksessä](/blogi/tekoaly-yrityksen-arvonmaarityksessa)."
          ],
          "listItems": []
        },
        {
          "heading": "Usein kysytyt kysymykset yrityksen arvonmäärityksestä",
          "paragraphs": [
            "Lyhyet vastaukset yleisimpiin kysymyksiin:"
          ],
          "listItems": [
            "Mikä on yleisin menetelmä yrityksen arvonmäärityksessä? Kassavirtapohjainen DCF ja markkinapohjaiset kertoimet ovat käytetyimmät kannattaville yhtiöille. Luotettava arvio ei kuitenkaan nojaa yhteen menetelmään, vaan useampaan rinnakkain — ja perustelee, miksi osa jätettiin pois.",
            "Voiko yrityksen arvon laskea liikevaihdosta? Liikevaihtokerroin yksin kertoo vähän, koska sama liikevaihto voi tuottaa hyvin erikokoisen tuloksen. Kerroin toimii lähinnä apuvälineenä, kun se suhteutetaan kannattavuuteen.",
            "Mikä menetelmä sopii tappiolliselle yritykselle? Substanssiarvo antaa arvolle lattian, ja tuottopohjainen arvo edellyttää uskottavaa käännettä. Rehellinen analyysi erottaa perusskenaarion ja käänteen optioarvon toisistaan — ja osakkeen arvo ei laske alle nollan.",
            "Miksi arvonmääritys antaa välin eikä yhtä lukua? Koska tulevaisuus on epävarma. Skenaarioiden todennäköisyyksillä painotettu odotusarvo ja arvostusväli kertovat enemmän kuin piste-estimaatti: ne näyttävät, mihin suuntaan riskit kallistavat arvoa.",
            "Riittääkö itse tehty laskelma yrityskauppaan? Se on hyvä lähtökohta, mutta tyypilliset virheet — normalisoimaton tulos, unohtunut nettovelka, liian optimistinen päätearvo — toistuvat omissa laskelmissa usein. Perusteltu ulkopuolinen analyysi kannattaa hankkia vähintään toiseksi mielipiteeksi, ja isoihin transaktioihin myös asiantuntija-arvio."
          ]
        }
      ]
    },
    {
      "slug": "tekoaly-yrityksen-arvonmaarityksessa",
      "seoTitle": "Tekoäly yrityksen arvonmäärityksessä: mihin se pystyy ja mihin ei",
      "metaDescription": "Tekoäly nopeuttaa arvonmäärityksen ja lukee jokaisen tilinpäätösrivin — mutta lukuja se ei saa keksiä. Näin pakotettu numerokuri erottaa validoidun raportin arvauksesta.",
      "h1": "Tekoäly yrityksen arvonmäärityksessä — mihin se pystyy ja mihin ei",
      "date": "2026-07-02",
      "excerpt": "Tekoäly tekee arvonmäärityksessä osan työstä paremmin kuin ihminen — ja osaa sen ei pidä antaa tehdä lainkaan. Rehellinen erittely vahvuuksista, rajoista ja siitä, miksi keksitty luku kaataa koko raportin generoinnin.",
      "sections": [
        {
          "heading": "Mitä tekoäly tekee yrityksen arvonmäärityksessä?",
          "paragraphs": [
            "Tekoäly toimii arvonmäärityksessä analyytikon työvälineenä: se lukee tilinpäätösdatan rivi riviltä, käy läpi julkiset lähteet ja kirjoittaa analyysin, johon asiantuntijalta kuluisi päiviä. Lukuja se ei saa keksiä — luotettavassa toteutuksessa laskenta on determinististä ja jokainen tekstin euromäärä jäljitetään todennettuun dataan. Tekoäly nopeuttaa ja laajentaa analyysiä; tulkinta, neuvottelu ja vastuu jäävät ihmiselle.",
            "Tässä kirjoituksessa käymme rehellisesti läpi, mihin tekoäly arvonmäärityksessä pystyy, mitä sen ei pidä antaa tehdä ja miksi validoitu laskentaprosessi antaa eri tuloksen kuin arvon kysyminen suoraan keskustelevalta kielimallilta."
          ],
          "listItems": []
        },
        {
          "heading": "Mihin tekoäly pystyy arvonmäärityksessä hyvin?",
          "paragraphs": [
            "Tekoälyn vahvuudet ovat mekaanisia mutta merkittäviä:"
          ],
          "listItems": [
            "Nopeus: raportti valmistuu yleensä saman työpäivän aikana, kun perinteinen konsulttiselvitys vie viikkoja.",
            "Kattavuus: tekoäly lukee jokaisen tilinpäätösrivin ja liitetiedon eikä ohita mitään aikapaineen takia — ihmisanalyytikko joutuu priorisoimaan, kone ei väsy.",
            "Johdonmukaisuus: sama menetelmävalinnan logiikka ja sama kurinalaisuus jokaiselle yhtiölle, kohteen koosta ja kiinnostavuudesta riippumatta.",
            "Perustelujen kirjoittaminen: kone jaksaa selittää jokaisen luvun taustan ja dokumentoida myös hylätyt menetelmät — työvaihe, joka käsityönä jää usein tekemättä."
          ]
        },
        {
          "heading": "Mitä tekoälyn ei pidä antaa tehdä arvonmäärityksessä?",
          "paragraphs": [
            "Keksiä lukuja. Kielimalli on rakennettu tuottamaan uskottavan kuuloista tekstiä — ja se tuottaa yhtä sujuvasti myös uskottavan kuuloisia lukuja. Tavallisessa tekstissä tämä on harmi; arvonmäärityksessä se tekee koko raportista arvottoman, koska yksikin keksitty euromäärä vie pohjan kaikilta muilta.",
            "Siksi raportissamme numerokuri on pakotettu koodilla, ei pelkällä ohjeistuksella. Jokaisen analyysitekstin euromäärän on jäljityttävä todennettuun tilinpäätösdataan tai dokumentoituun laskentaan. Jos yksikin luku ei jäljity, raportin generointi epäonnistuu — puutteellista raporttia ei toimiteta. Sama kuri koskee laadullisia väitteitä: verkkolähteistä poimitut väitteet saavat tekstiin lähdeviitteen (lähde ja päivämäärä) ja päätyvät raportin klikattavaan lähdeluetteloon."
          ],
          "listItems": []
        },
        {
          "heading": "Miten varmistetaan, ettei tekoäly keksi lukuja?",
          "paragraphs": [
            "Prosessi etenee kuudessa vaiheessa:"
          ],
          "listItems": [
            "1. Yhtiön tilinpäätösdata haetaan ja todennetaan ennen analyysin aloittamista.",
            "2. Arvonmäärityslaskenta — DCF, EVA, kertoimet, substanssi — tehdään deterministisillä laskentamalleilla, ei kielimallilla.",
            "3. Tekoäly kirjoittaa analyysitekstin valmiiden laskentatulosten päälle ja perustelee menetelmävalinnat yhtiön profiilin mukaan.",
            "4. Ohjelmalliset tarkistukset käyvät läpi tekstin jokaisen euromäärän ja vertaavat sitä dataan ja dokumentoituun laskentaan.",
            "5. Jos luku ei jäljity, generointi keskeytyy ja raportti hylätään — virhe ei pääse asiakkaalle asti.",
            "6. Verkkolähteisiin perustuvat laadulliset väitteet varustetaan lähdeviitteillä, jotka lukija voi tarkistaa itse."
          ]
        },
        {
          "heading": "Miksi ChatGPT antaa eri tuloksen kuin validoitu arvonmääritys?",
          "paragraphs": [
            "Kun kysyt yleiskäyttöiseltä kielimallilta yrityksen arvoa, se vastaa sen perusteella, mitä sille kerrot ja mitä se on oppinut. Sillä ei ole todennettua tilinpäätösdataa, deterministisiä laskentamalleja eikä tarkistuksia, jotka estäisivät aukkojen paikkaamisen uskottavilla luvuilla. Sama kysymys voi tuottaa eri päivinä eri arvon, eikä kumpaakaan voi jäljittää mihinkään.",
            "Tämä ei tarkoita, että kielimallit olisivat huonoja — hahmotteluun ja kysymysten muotoiluun ne sopivat hyvin. Ero ei ole mallin älykkyydessä vaan rakenteessa sen ympärillä: neuvotteluun tai dokumentointiin tarvitaan toistettavuus ja jäljitettävyys. Validoidussa prosessissa sama data tuottaa saman laskennan, ja jokainen tekstin luku on tarkistettu sitä vasten. Kyse on eri työkalusta eri tarkoitukseen."
          ],
          "listItems": []
        },
        {
          "heading": "Mikä arvonmäärityksessä jää ihmiselle?",
          "paragraphs": [
            "Kolme asiaa ei automatisoidu:"
          ],
          "listItems": [
            "Neuvottelu: hinta syntyy neuvottelupöydässä, ei raportissa. Raportti antaa perustellun välin ja arvon ajurit — argumentit, ei lopputulosta.",
            "Due diligence: sopimukset, asiakassuhteet, avainhenkilöriskit ja riidat eivät näy tilinpäätöksessä. Niiden tarkastaminen on ihmistyötä.",
            "Vastuu ja harkinta: isoon transaktioon kannattaa hankkia asiantuntija-arvio. AI-raportti on nopea ja edullinen ensimmäinen askel tai toinen mielipide — ei neuvonantajan korvaaja kaupan viimeistelyssä."
          ]
        },
        {
          "heading": "Voiko raportin oletuksiin vaikuttaa itse?",
          "paragraphs": [
            "Kyllä. Tilauksen yhteydessä voi antaa lisätietoja ja omia oletuksia: skenaarioiden todennäköisyydet, tiedossa olevat sopimukset tai omistajan aikomukset. Analyysi ottaa ne huomioon — mutta numerokuri ei jousta. Myös omiin oletuksiin perustuvat luvut jäljitetään ja dokumentoidaan, joten raportti kertoo aina, mikä perustuu dataan ja mikä annettuun oletukseen.",
            "Samasta rehellisyydestä seuraa myös raportin oikea käyttötapa: se on analyysiraportti päätöksenteon tueksi — ei fairness opinion, tilintarkastus, sijoitusneuvonta tai oikeudellinen käyvän arvon lausunto."
          ],
          "listItems": []
        },
        {
          "heading": "Mitä AI-arvonmääritysraportti maksaa ja miten sen saa?",
          "paragraphs": [
            "Raportin laadun voi tarkistaa ilmaiseksi: [esimerkkiraportit](/#esimerkit) ovat avoimia ilman rekisteröitymistä, ja mukana on julkisista tiedoista laadittu todellinen [Supercell Oy:n raportti](/samples/esimerkkiraportti-supercell.pdf). Yksittäinen yrityskohtainen raportti maksaa [79 € + alv ja kolmen raportin paketti 199 € + alv](/#hinnoittelu). Raportti toimitetaan PDF:nä sähköpostiin yleensä saman työpäivän aikana — [tilaukseen](/#tilaa) riittää yrityksen nimi tai Y-tunnus. Jos arvonmääritysmenetelmät ovat vieraita, aloita kirjoituksesta [Miten yrityksen arvo määritetään?](/blogi/miten-yrityksen-arvo-maaritetaan)"
          ],
          "listItems": []
        },
        {
          "heading": "Usein kysytyt kysymykset tekoälystä arvonmäärityksessä",
          "paragraphs": [
            "Lyhyet vastaukset yleisimpiin kysymyksiin:"
          ],
          "listItems": [
            "Keksiikö tekoäly lukuja raporttiin? Ei. Ohjelmalliset tarkistukset vertaavat tekstin jokaista euromäärää todennettuun dataan ja dokumentoituun laskentaan. Jos luku ei jäljity, raportin generointi epäonnistuu eikä raporttia toimiteta.",
            "Onko tekoälyn tekemä arvonmääritys luotettava? Luotettavuus riippuu rakenteesta, ei mallista: deterministinen laskenta, pakotettu numerokuri, lähdeviitteet ja näkyvät datan rajoitteet erottavat validoidun raportin vapaasta tekstintuotannosta. Raportti kertoo itse, mihin sen luvut perustuvat.",
            "Miten AI-raportti eroaa siitä, että kysyn arvoa ChatGPT:ltä? Keskusteleva kielimalli vastaa ilman todennettua dataa ja ilman tarkistuksia, ja sama kysymys voi tuottaa eri kerroilla eri vastauksen. Validoitu prosessi tuottaa samasta datasta saman laskennan ja tarkistetun tekstin.",
            "Korvaako tekoäly arvonmäärityksen asiantuntijan? Ei isoissa transaktioissa. Raportti on nopea ja edullinen ensimmäinen askel tai toinen mielipide; neuvottelu, due diligence ja vastuu jäävät ihmisille.",
            "Onko raportti virallinen käyvän arvon lausunto? Ei. Se on analyysiraportti päätöksenteon tueksi — ei tilintarkastus, fairness opinion, sijoitusneuvonta tai oikeudellinen lausunto, eikä sellaisenaan verotukseen kelpaava arvo."
          ]
        }
      ]
    }
  ]
}

export const blogIndexIntro: string = data.indexIntro
export const blogPosts: BlogPost[] = data.posts
