export const commandSuggestions = [
  // Comenzi de navigare
  { trigger: "cal", suggestion: "calendar" },
  { trigger: "pos", suggestion: "pos" },
  { trigger: "fa", suggestion: "facturi" },
  { trigger: "st", suggestion: "stocuri" },
  { trigger: "rap", suggestion: "rapoarte" },
  
  // Comenzi pentru rezervări
  { trigger: "rez", suggestion: "rezervare [tip cameră] [nume] [dată] [preferințe]" },
  { trigger: "mod", suggestion: "modifica [nr camera] [data]" },
  
  // Comenzi pentru camere
  { trigger: "adaug", suggestion: "adauga camera [numar] [tip]" },
  { trigger: "modc", suggestion: "modifica camera [numar]" },
  { trigger: "tel", suggestion: "telefon [nr camera] [data]" },
  
  // Comenzi pentru vânzări și produse
  { trigger: "vin", suggestion: "vinde [cantitate] [produs]" },

  
  
  // Comenzi diverse
  { trigger: "rap", suggestion: "raport [tip] [perioada]" },
  { trigger: "aju", suggestion: "ajutor" },
  { trigger: "?", suggestion: "ajutor" },
];