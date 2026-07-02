import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tietosuojaseloste | Valuatum Arvonmääritys',
  description:
    'Valuatum Oy:n arvonmäärityspalvelun tietosuojaseloste: mitä tietoja keräämme tilauksen yhteydessä, mihin niitä käytetään ja mitkä ovat oikeutesi.',
  alternates: { canonical: '/tietosuoja' },
}

const H2 = 'mt-10 text-xl font-semibold tracking-tight text-forest'
const P = 'mt-3 text-[15px] leading-relaxed text-charcoal/80'

export default function TietosuojaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
      <h1 className="text-3xl font-semibold tracking-tight text-forest">Tietosuojaseloste</h1>
      <p className={P}>Päivitetty 2.7.2026 · EU:n yleinen tietosuoja-asetus (GDPR)</p>

      <h2 className={H2}>Rekisterinpitäjä</h2>
      <p className={P}>
        Valuatum Oy, Helsinki. Yhteydenotot tietosuoja-asioissa:{' '}
        <a className="text-green underline" href="mailto:company-valuation@valuatum.com">
          company-valuation@valuatum.com
        </a>
      </p>

      <h2 className={H2}>Mitä tietoja keräämme</h2>
      <p className={P}>
        Raporttitilauksen yhteydessä keräämme: yrityksen nimen tai Y-tunnuksen, sähköpostiosoitteen
        (raportin toimitusta varten) sekä tilaajan vapaaehtoisesti antamat lisätiedot ja oletukset.
        Sivusto ei käytä seuranta- tai markkinointievästeitä.
      </p>

      <h2 className={H2}>Mihin tietoja käytetään</h2>
      <p className={P}>
        Tietoja käytetään ainoastaan tilatun arvonmääritysraportin laatimiseen ja toimittamiseen sekä
        tilaukseen liittyvään yhteydenpitoon (käsittelyperuste: sopimuksen täytäntöönpano). Tilauksen
        yhteydessä annettuja lisätietoja käytetään raportin analyysin osana. Tietoja ei myydä eikä
        luovuteta kolmansille osapuolille markkinointiin.
      </p>

      <h2 className={H2}>Käsittelijät ja tietojen sijainti</h2>
      <p className={P}>
        Raportin laadinnassa käytetään tietojen käsittelijöinä pilvipalvelu- ja
        tekoälymallitoimittajia. Annetut lisätiedot välitetään analyysiä varten kielimallipalvelulle;
        tietoja ei käytetä mallien kouluttamiseen. Yrityksen taloustiedot haetaan julkisista ja
        lisensoiduista lähteistä.
      </p>

      <h2 className={H2}>Säilytysaika</h2>
      <p className={P}>
        Tilaustiedot ja raportit säilytetään niin kauan kuin se on tarpeen palvelun toimittamiseksi ja
        kirjanpitovelvoitteiden täyttämiseksi, minkä jälkeen ne poistetaan.
      </p>

      <h2 className={H2}>Oikeutesi</h2>
      <p className={P}>
        Sinulla on oikeus saada pääsy tietoihisi, pyytää niiden oikaisemista tai poistamista sekä
        vastustaa käsittelyä. Pyynnöt sähköpostitse yllä olevaan osoitteeseen. Sinulla on myös oikeus
        tehdä valitus tietosuojavaltuutetulle (tietosuoja.fi).
      </p>
    </article>
  )
}
