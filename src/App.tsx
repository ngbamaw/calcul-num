import React, { useCallback, useEffect, useState } from "react";
import DimensionSelector from "./components/DimensionSelector";
import prices from "./price.json";

const { dimensions } = prices.bobine;

const usbPrice =
  prices.bobine.type.find((type) => type.nom === "usb")?.prixInitial || 0;
const dvdPrice =
  prices.bobine.type.find((type) => type.nom === "dvd")?.prixInitial || 0;
const usbDvdPrice =
  prices.bobine.type.find((type) => type.nom === "usb-dvd")?.prixInitial || 0;

type Entry = {
  diameter: number;
  price: number;
  quantity: number;
};

const initialEntries: Entry[] = [
  {
    diameter: dimensions[0].diametre,
    price: dimensions[0].prixUnite,
    quantity: 0,
  },
];

function App() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const remainingDimensions = dimensions.filter(
    (dimension) =>
      !entries.some((entry) => entry.diameter === dimension.diametre)
  );

  const addDimension = useCallback(() => {
    setEntries([
      ...entries,
      {
        diameter: remainingDimensions[0].diametre,
        price: remainingDimensions[0].prixUnite,
        quantity: 0,
      },
    ]);
  }, [entries]);

  const exclude = useCallback(
    (exception: Entry) => {
      return entries
        .filter((entry) => entry !== exception)
        .map((entry) => entry.diameter);
    },
    [entries]
  );

  const calculateTotal = useCallback(
    (priceInital: number) =>
      entries.reduce(
        (acc, entry) => acc + entry.price * entry.quantity,
        priceInital
      ),
    [entries]
  );

  const changeDimension = useCallback(
    (index: number) => (diameter: number) => {
      const newEntries = [...entries];
      newEntries[index].diameter = diameter;
      setEntries(newEntries);
    },
    [entries]
  );
  const changeQuantity = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEntries = [...entries];
      newEntries[index].quantity = +e?.target?.value || 0;
      setEntries(newEntries);
    },
    [entries]
  );

  const removeDimension = useCallback(
    (entry: Entry) => () => {
      const newEntries = entries.filter((e) => e !== entry);
      setEntries(newEntries);
    },
    [entries]
  );

  return (
    <main>
      <ul className="entry-list">
        {entries.map((entry, index) => (
          <li key={index} className="entry">
            <DimensionSelector
              exclude={exclude(entry)}
              value={entry.diameter}
              onChange={changeDimension(index)}
            />
            <input
              type="number"
              value={entry.quantity}
              onChange={changeQuantity(index)}
            />
            {entries.length > 1 && (
              <button onClick={removeDimension(entry)}>X</button>
            )}
          </li>
        ))}
      </ul>
      <button className="add-dimension" onClick={addDimension}>
        Ajouter une dimension
      </button>
      <ul className="result-calculation">
        <li>
          <p>Clé USB</p>
          <p>{calculateTotal(usbPrice)} €</p>
        </li>
        <li>
          <p>DVD</p>
          <p>{calculateTotal(dvdPrice)} €</p>
        </li>
        <li>
          <p>Clé USB + DVD</p>
          <p>{calculateTotal(usbDvdPrice)} €</p>
        </li>
      </ul>
    </main>
  );
}

export default App;
