export const CAR_BRANDS = [
  { label: 'Peugeot', models: ['208', '308', '508', '2008', '3008', '4008', '5008', 'Expert', 'Rifter'] },
  { label: 'Renault', models: ['Clio', 'Zoe', 'Megane', 'Captur', 'Kadjar', 'Austral', 'Scenic', 'Twingo', 'Master'] },
  { label: 'Citroën', models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Ami', 'C3 Aircross'] },
  { label: 'DS Automobiles', models: ['DS 3', 'DS 4', 'DS 7 Crossback', 'DS 9'] },
  { label: 'Dacia', models: ['Sandero', 'Duster', 'Jogger', 'Spring'] },
  { label: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  { label: 'BMW', models: ['i3', 'i4', 'iX', 'Series 1', 'Series 3', 'X1', 'X3', 'X5'] },
  { label: 'Mercedes-Benz', models: ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'EQS'] },
  { label: 'Audi', models: ['A1', 'A3', 'A4', 'Q2', 'Q3', 'Q5', 'e-tron'] },
  { label: 'Volkswagen', models: ['Golf', 'Polo', 'Tiguan', 'ID.3', 'ID.4', 'T-Roc'] },
  { label: 'Toyota', models: ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Prius'] },
  { label: 'Fiat', models: ['500', '500X', 'Panda'] },
  { label: 'Hyundai', models: ['i10', 'i20', 'Kona', 'Tucson', 'Ioniq 5'] },
  { label: 'Kia', models: ['Picanto', 'Niro', 'Sportage', 'EV6'] },
  { label: 'Ford', models: ['Fiesta', 'Focus', 'Puma', 'Kuga'] }
];

export const getCarPageLabels = (lang: string) => {
  const isFrench = lang === 'fr';
  
  return {
    brand: isFrench ? 'Marque' : 'Brand',
    model: isFrench ? 'Modèle' : 'Model',
    brandPlaceholder: isFrench ? 'ex: Tesla' : 'e.g. Tesla',
    modelPlaceholder: isFrench ? 'ex: Modèle 3' : 'e.g. Model 3',
    noOptions: isFrench ? 'Aucun résultat trouvé' : 'No results found',
    primaryImage: isFrench ? 'PRINCIPAL' : 'PRIMARY',
    uploadHint: isFrench 
      ? 'La primeira image sera définie como principale.' 
      : 'The first image will be set as primary.',
    clickToUpload: isFrench ? 'Cliquez pour sélectionner' : 'Click to select images',
  };
};