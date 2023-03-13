import React, { useCallback, useMemo, useState } from "react";
import ReelIcon from "./assets/reel-film.svg";
import USBIcon from "./assets/usb-icon.svg";
import prices from "./price.json";

const { dimensions } = prices.bobine;
const { reductions } = prices.bobine;

const formater = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumber = (number: number) => {
  return formater.format(Number(number.toFixed(2)));
};

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
  quantity: "",
}));

const InputNumber = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const checkValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      onChange(e);
      return;
    }
    const value = Number(e.target.value);
    if (value >= 0) {
      onChange(e);
    }
  };

  return <input min={0} type="text" value={value} onChange={checkValue} />;
};

const findReduction = (total: number) => {
  let result = null;
  const listReductions = reductions.sort((a, b) => a.seuil - b.seuil);
  for (const reduction of listReductions) {
    if (reduction.seuil <= total) {
      result = reduction;
    }
  }
  return result;
};

interface PriceProps {
  reduction: typeof reductions[number] | null;
  total: number;
}

const Price = ({ reduction, total }: PriceProps) => {
  return (
    <div>
      {reduction && <p className="price-initial">{formatNumber(total)} €</p>}
      <p className="price-total">
        {reduction
          ? formatNumber(total * (1 - reduction.reduction))
          : formatNumber(total)}{" "}
        €
      </p>
      {reduction && <p>{formatNumber(-(total * reduction.reduction))} €</p>}

      {reduction && <p> {reduction.reduction * 100}% de remise</p>}
    </div>
  );
};

function App() {
  const [entries, setEntries] = useState(initialEntries);
  const [email, setEmail] = useState("");

  const totalQuantity = entries.reduce(
    (acc, entry) => acc + Number(entry.quantity),
    0
  );

  const totalDuration = entries.reduce(
    (acc, entry) => acc + entry.nbMinute * Number(entry.quantity),
    0
  );

  const hasEntries = entries.some((entry) => Number(entry.quantity) > 0);

  const calculateTotal = useCallback(
    (priceInital: number) =>
      hasEntries
        ? entries.reduce(
            (acc, entry) => acc + entry.price * Number(entry.quantity),
            priceInital
          )
        : 0,
    [entries]
  );

  const changeQuantity = useCallback(
    (dimension: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEntries = entries.map((entry) =>
        entry.diameter === dimension
          ? { ...entry, quantity: e.target.value }
          : entry
      );
      setEntries(newEntries);
    },
    [entries]
  );

  const totalUsb = useMemo(() => calculateTotal(usbPrice), [calculateTotal]);
  const totalDvd = useMemo(
    () =>
      hasEntries
        ? calculateTotal(dvdPrice) +
          (Math.ceil(totalDuration / 90) - 1) * dvdPrice
        : 0,
    [calculateTotal]
  );
  const totalUsbDvd = useMemo(
    () =>
      hasEntries
        ? calculateTotal(usbDvdPrice) +
          (Math.ceil(totalDuration / 90) - 1) * dvdPrice
        : 0,
    [calculateTotal]
  );

  const reductionUsb = findReduction(totalUsb);
  const reductionDvd = findReduction(totalUsb);
  const reductionUsbDvd = findReduction(totalUsb);

  const sendMail = useCallback(async () => {
    const data = {
      bobines: entries.filter((entry) => Number(entry.quantity) > 0).map,
      email,
      prices: {
        usb: {
          reduction: reductionUsb
            ? formatNumber(totalUsb * (1 - reductionUsb.reduction))
            : null,
          initial: totalUsb,
          total: reductionUsb
            ? formatNumber(totalUsb * (1 - reductionUsb.reduction))
            : formatNumber(totalUsb),
        },
        dvd: {
          reduction: reductionDvd
            ? formatNumber(totalDvd * (1 - reductionDvd.reduction))
            : null,
          initial: totalDvd,
          total: reductionDvd
            ? formatNumber(totalDvd * (1 - reductionDvd.reduction))
            : formatNumber(totalDvd),
        },
        usbDvd: {
          reduction: reductionUsbDvd
            ? formatNumber(totalUsbDvd * (1 - reductionUsbDvd.reduction))
            : null,
          initial: totalUsbDvd,
          total: reductionUsbDvd
            ? formatNumber(totalUsbDvd * (1 - reductionUsbDvd.reduction))
            : formatNumber(totalUsbDvd),
        },
      },
    };

    const response = await fetch("https://api.lesfilmsdusiecle.fr/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Votre demande a bien été prise en compte");
    } else {
      alert("Une erreur est survenue");
    }
  }, [entries, email, totalUsb, totalDvd, totalUsbDvd]);

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
                <InputNumber
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
                <InputNumber
                  value={entry.quantity}
                  onChange={changeQuantity(entry.diameter)}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <p>Nombre de bobines: {totalQuantity}</p>
      <p>Durée: {totalDuration}min</p>

      <h2>Votre estimation</h2>
      <section id="introduction">
        <p>
          Devis pour la numérisation de 1 bobines, d'une durée d'environ 4
          minutes.
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
              <Price total={totalUsb} reduction={reductionUsb} />
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
              <Price total={totalDvd} reduction={reductionDvd} />
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
              <Price total={totalUsbDvd} reduction={reductionUsbDvd} />
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
            <Price total={totalUsb} reduction={reductionUsb} />

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
            <Price total={totalDvd} reduction={reductionDvd} />

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
            <Price total={totalUsbDvd} reduction={reductionUsbDvd} />

            <span className="entry-subtitle">CLÉ USB + DVD</span>
            <p>
              Vos bobines sur clé USB et DVD. Les supports ne sont pas protégés
              et peuvent être copiés à volonté. Visionnez vos super8 et 8mm sur
              tout type de lecteur.
            </p>
          </div>
        </li>
      </ul>
      <div className="email-section">
        <p>Recevez ce devis par mail</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => sendMail()}>Envoyer</button>
      </div>
    </main>
  );
}

export default App;
