import React, { useCallback, useState } from "react";
import ReelIcon from "./assets/reel-film.svg";
import USBIcon from "./assets/usb-icon.svg";
import prices from "./price.json";

const { dimensions } = prices.bobine;

const usbPrice =
  prices.bobine.type.find((type) => type.nom === "usb")?.prixInitial || 0;
const dvdPrice =
  prices.bobine.type.find((type) => type.nom === "dvd")?.prixInitial || 0;
const usbDvdPrice =
  prices.bobine.type.find((type) => type.nom === "usb-dvd")?.prixInitial || 0;

const initialEntries = dimensions.map((dimension) => ({
  diameter: dimension.diametre,
  price: dimension.prixUnite,
  nbMeter: dimension.nbMetre,
  nbMinute: dimension.nbMinute,
  quantity: 0,
}));

function App() {
  const [entries, setEntries] = useState(initialEntries);

  const hasEntries = entries.some((entry) => entry.quantity > 0);

  const calculateTotal = useCallback(
    (priceInital: number) =>
      entries.reduce(
        (acc, entry) => acc + entry.price * entry.quantity,
        priceInital
      ),
    [entries]
  );

  const changeQuantity = useCallback(
    (dimension: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEntries = entries.map((entry) =>
        entry.diameter === dimension
          ? { ...entry, quantity: Number(e.target.value) }
          : entry
      );
      setEntries(newEntries);
    },
    [entries]
  );

  return (
    <main>
      <h2>Numérisation films Super 8, 8mm, 9,5mm et 16mm</h2>
      <section className="introduction">
        <p>
          Renseignez dans les cases ci-dessous le nombre de films Super 8, 8mm,
          9,5mm et 16mm à numériser en fonction du diamètre des bobines.
        </p>
        <img className="reel-icon" src={ReelIcon} />
        <p>
          NB : Une bobine de 17,5 cm contient normalement 120 mètres de film. Si
          cependant elle ne contient par exemple que 50 mètres de films, nous la
          facturons comme une bobine de 60 mètres. La plupart des bobines (sauf
          celles de 7,5 cm) possèdent des graduations vous permettant de
          déterminer le nombre de mètres de film.
        </p>
        <p>
          Les tarifs ci-dessous sont valables pour une numérisation en 2K. Nous
          pouvons également numériser en 4K mais le processus est plus lent,
          ainsi il faudra ajouter 50% au tarif de la 2K. Exemple : si tarif
          indiqué pour la 2K = 100 €, alors tarif pour la 4K = 150 €
        </p>
      </section>
      <h3>Super8, 8mm, 9,5mm, 16mm & S16</h3>
      <table className="entry-list">
        <thead>
          <tr className="entry">
            <th>Nombre</th>
            <th>Diamètre</th>
            <th>jusqu'à</th>
            <th>Jusqu'à</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index} className="entry">
              <td>
                <input
                  min={0}
                  type="number"
                  value={entry.quantity}
                  onChange={changeQuantity(entry.diameter)}
                />
              </td>
              <td>{entry.diameter / 10} cm</td>
              <td>{entry.nbMeter} mètres</td>
              <td>{entry.nbMinute} min</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="entries-list-mobile">
        {entries.map((entry, index) => (
          <li key={index} className="entry-mobile">
            <h4>Diamètre {entry.diameter / 10} cm</h4>
            <div className="entry-content">
              <div className="entry-details">
                <p>jusqu'à {entry.nbMeter} mètres</p>
                <p>jusqu'à {entry.nbMinute} min</p>
              </div>
              <label className="entry-input">
                <p>Nombre :</p>
                <input
                  min={0}
                  type="number"
                  value={entry.quantity}
                  onChange={changeQuantity(entry.diameter)}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <h2>Votre estimation</h2>
      <section id="introduction">
        <p>
          Devis pour la numérisation de 1 bobines, d'une durée d'environ 4
          minutes. Estimation du poids (en Go) de votre commande : environ 0.4
          Go
        </p>
      </section>

      <h3>Tarifs</h3>
      <table className="entry-list">
        <thead>
          <tr className="entry">
            <th>Transfert</th>
            <th>Tarifs</th>
            <th>Infos</th>
          </tr>
        </thead>
        <tbody>
          <tr className="entry">
            <td>
              <h4>Clé USB</h4>
            </td>
            <td>
              <p className="price-total">
                {hasEntries ? calculateTotal(usbPrice) : 0} €
              </p>
            </td>
            <td>
              <div>
                <p className="entry-subtitle">
                  CLÉ USB ou LIEN DE TELECHARGEMENT
                </p>
                <p>
                  Visionnez facilement vos films (TV, PC, tablette),
                  partagez-les avec votre entourage, faites des montages vidéo,
                  etc. La clé USB est à fournir ou à acheter chez nous.
                  TELECHARGEMENT : recevez vos films rapidement via un lien de
                  téléchargement que vous pourrez aussi transmettre à vos
                  proches. Frais : 5 € + 2 € par lien
                </p>
              </div>
            </td>
          </tr>
          <tr className="entry">
            <td>
              <h4>DVD</h4>
            </td>
            <td>
              <p className="price-total">
                {hasEntries ? calculateTotal(dvdPrice) : 0} €
              </p>
            </td>
            <td>
              <div>
                <p className="entry-subtitle">DVD</p>
                <p>
                  Vos super8 en DVD. Les DVD ne sont pas protégés et peuvent
                  être copiés à volonté. Si vous préférez cette option, nous
                  vous conseillons plutôt l'option Clé USB + DVD car les
                  lecteurs DVD sont entrain de disparaître (tablettes, nouveaux
                  PC ...)
                </p>
              </div>
            </td>
          </tr>
          <tr className="entry">
            <td>
              <h4>Clé USB + DVD</h4>
            </td>
            <td>
              <p className="price-total">
                {hasEntries ? calculateTotal(usbDvdPrice) : 0} €
              </p>
            </td>
            <td>
              <div>
                <p className="entry-subtitle">Clé USB + DVD</p>
                <p>
                  Vos bobines sur clé USB et DVD. Les supports ne sont pas
                  protégés et peuvent être copiés à volonté. Visionnez vos
                  super8 et 8mm sur tout type de lecteur.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <ul className="entries-list-mobile">
        <li className="entry-mobile">
          <h4>Clé USB</h4>
          <div className="entry-content">
            <p className="price-total">
              {hasEntries ? calculateTotal(usbPrice) : 0} €
            </p>

            <span className="entry-subtitle">
              CLÉ USB ou LIEN DE TELECHARGEMENT
            </span>
            <p>
              Visionnez facilement vos films (TV, PC, tablette), partagez-les
              avec votre entourage, faites des montages vidéo, etc. La clé USB
              est à fournir ou à acheter chez nous. TELECHARGEMENT : recevez vos
              films rapidement via un lien de téléchargement que vous pourrez
              aussi transmettre à vos proches. Frais : 5 € + 2 € par lien
            </p>
          </div>
        </li>
        <li className="entry-mobile">
          <h4>DVD</h4>

          <div className="entry-content">
            <p className="price-total">
              {hasEntries ? calculateTotal(dvdPrice) : 0} €
            </p>

            <span className="entry-subtitle">DVD</span>
            <p>
              Vos super8 en DVD. Les DVD ne sont pas protégés et peuvent être
              copiés à volonté. Si vous préférez cette option, nous vous
              conseillons plutôt l'option Clé USB + DVD car les lecteurs DVD
              sont entrain de disparaître (tablettes, nouveaux PC ...)
            </p>
          </div>
        </li>
        <li className="entry-mobile">
          <h4>Clé USB + DVD</h4>
          <div className="entry-content">
            <p className="price-total">
              {hasEntries ? calculateTotal(usbDvdPrice) : 0} €
            </p>

            <span className="entry-subtitle">CLÉ USB + DVD</span>
            <p>
              Vos bobines sur clé USB et DVD. Les supports ne sont pas protégés
              et peuvent être copiés à volonté. Visionnez vos super8 et 8mm sur
              tout type de lecteur.
            </p>
          </div>
        </li>
      </ul>
    </main>
  );
}

export default App;
