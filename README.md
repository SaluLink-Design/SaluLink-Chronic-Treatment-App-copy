# SaluLink Chronic Treatment App

A React-based application designed to assist medical specialists and their assistant teams in accurately documenting chronic cardiovascular and endocrine disorder cases for Prescribed Minimum Benefit (PMB) compliance.

## Features

- **ClinicalBERT Integration**: Natural language processing of specialist notes to detect chronic conditions
- **Authi 1.0 Integration**: PMB compliance guidance, ICD-10 code retrieval, treatment basket mapping, and medicine list generation
- **ICD-10 Code Mapping**: Automatic mapping of detected conditions to ICD-10 codes
- **Treatment Basket Management**: Diagnostic and ongoing management baskets with procedure codes and limits
- **Medicine Selection**: Medicine classes, names, claimable daily amounts (CDAs), and plan exclusions
- **PDF Export**: Generate PMB-compliant claim documents

## Tech Stack

- **Frontend**: React with Next.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **TypeScript**: Type-safe development

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
salulink-app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── sidebar.tsx      # Navigation sidebar
│   │   ├── patient-notes-input.tsx
│   │   ├── icd-code-selector.tsx
│   │   ├── treatment-basket-selector.tsx
│   │   └── medicine-selector.tsx
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   ├── data-loader.ts   # CSV data loading
│   │   ├── clinicalbert-service.ts
│   │   ├── authi-service.ts
│   │   └── pdf-service.ts
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── public/
│   └── data/                # CSV data files
└── tailwind.config.ts       # Tailwind configuration
```

## Data Files

The application uses the following CSV files for data:

- `Cardiovascular CONDITIONS.csv` - Cardiovascular conditions and ICD-10 codes
- `Endocrine CONDITIONS.csv` - Endocrine conditions and ICD-10 codes
- `Cardiovascular TREATMENT.csv` - Cardiovascular treatment baskets
- `Endocrine TREATMENT.csv` - Endocrine treatment baskets
- `Cardiovascular MEDICINE.csv` - Cardiovascular medicines
- `Endocrine MEDICINE.csv` - Endocrine medicines

## Workflow

1. **Input Stage**: Specialist enters clinical notes
2. **Analysis**: ClinicalBERT processes notes to detect conditions
3. **ICD-10 Selection**: Authi 1.0 maps conditions to ICD-10 codes
4. **Treatment Mapping**: PMB treatment baskets are generated
5. **Medicine Selection**: Medicines are filtered by plan type
6. **Export**: PDF claim document is generated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.