# Financial Services Hub

A comprehensive financial services interface that provides three key services: ITR Helper, Asset Investment Analysis, and Equity Investment Strategy.

## Overview

The Financial Services Hub replaces the simple ITR Helper button with a professional, multi-service dialog that integrates with existing CA analysis reports to provide personalized financial recommendations.

## Components Structure

```
components/
├── financial-services/
│   ├── FinancialServicesDialog.tsx    # Main dialog hub
│   ├── ITRHelperForm.tsx             # ITR tax optimization service
│   ├── AssetInvestmentForm.tsx       # Real estate investment analysis
│   ├── EquityInvestmentForm.tsx      # Stock market investment strategy
│   └── index.ts                      # Component exports
├── itr-helper/
│   └── ITRHelperButton.tsx           # Updated to use new dialog
└── ui/
    ├── dialog.tsx                    # Simple dialog component
    ├── input.tsx                     # Input form component
    └── label.tsx                     # Label component
```

## Features

### 🏠 Main Hub
- **CA Report Detection**: Automatically detects existing CA analysis reports from localStorage
- **Service Selection**: Professional cards for each service with clear descriptions
- **Status Indicators**: Shows which services are available based on CA report availability
- **User-Friendly Navigation**: Easy back navigation between services

### 💰 ITR Helper Service
- **File Upload**: Drag & drop PDF document upload
- **Client Type Selection**: Salaried, Self-Employed, Businessman options
- **CA Integration**: Uses existing CA analysis or manual input
- **Professional UI**: Clean, organized form with progress indicators

**API Endpoint**: `POST /itr/analyze`
**Required Fields**:
- `client_type`: string (salaried, self-employed, businessman)
- `ca_markdown`: string (CA analysis content)
- `files`: File[] (PDF documents)

### 🏠 Asset Investment Analysis
- **Location-Based Analysis**: Enter preferred investment location
- **CA Report Integration**: Automatically uses CA analysis for financial capacity
- **Market Research**: Provides property market insights
- **Investment Recommendations**: Tailored suggestions based on financial profile

**API Endpoint**: `POST /asset/analyze`
**Required Fields**:
- `location`: string (investment location)
- `financial_report_text`: string (CA analysis markdown)

### 📈 Equity Investment Strategy
- **Comprehensive Form**: Sector, goal, style, duration, risk level selection
- **Professional Options**: Well-structured dropdown menus with clear descriptions
- **Risk Assessment**: Detailed risk level explanations
- **Portfolio Strategy**: Personalized investment recommendations

**API Endpoint**: `POST /equity/analyze`
**Required Fields**:
- `goal`: string (investment objective)
- `style`: string (invest, swing_trade, trade)
- `duration`: string (investment timeframe)
- `risk_level`: string (low, medium, high)
- `ca_report`: string (CA analysis content)
- `sector`: string (optional, preferred sector)

## Form Options

### Sector Options (Equity)
- Technology, Healthcare, Financial Services
- Consumer Goods, Energy, Real Estate
- Manufacturing, Telecommunications
- Agriculture, Infrastructure

### Investment Goals
- Long-term wealth creation
- Regular income generation
- Capital appreciation
- Retirement planning
- Child's education
- Emergency fund building
- Tax saving

### Investment Styles
- Long-term Investing (Hold for years)
- Swing Trading (Hold for weeks/months)
- Day Trading (Short-term)

### Investment Duration
- Less than 1 year
- 1-3 years, 3-5 years
- 5-10 years, 10+ years

### Risk Levels
- **Low Risk**: Conservative approach with stable returns
- **Medium Risk**: Balanced growth with moderate volatility
- **High Risk**: Aggressive growth with higher volatility

## Technical Implementation

### State Management
- Uses React hooks for form state
- localStorage integration for CA report data
- Loading states for all API calls

### Error Handling
- Form validation for required fields
- API error handling with user-friendly messages
- Fallback UI for missing CA reports

### Responsive Design
- Mobile-first approach with responsive grids
- Professional card layouts
- Accessible form controls

### Integration Points
- **CA Analysis**: Reads from localStorage `caAnalysisResult`
- **Navigation**: Redirects to respective report pages
- **Storage**: Stores results in localStorage for each service

## Usage

```tsx
import { FinancialServicesDialog } from '@/components/financial-services';

// Use as wrapper around trigger element
<FinancialServicesDialog>
  <button>Open Financial Services</button>
</FinancialServicesDialog>
```

## Data Flow

1. **Service Selection**: User opens dialog and sees available services
2. **CA Report Check**: System checks localStorage for existing CA analysis
3. **Form Completion**: User fills service-specific form
4. **API Submission**: Data sent to respective backend endpoint
5. **Result Storage**: API response stored in localStorage
6. **Navigation**: User redirected to result page

## Styling

- **Theme**: Professional amber/orange gradient theme
- **Components**: Clean card-based layouts
- **Icons**: Lucide React icons for consistency
- **Animation**: Framer Motion for smooth transitions
- **Typography**: Clear hierarchy with proper contrast

## Benefits

1. **Unified Experience**: Single entry point for all financial services
2. **Data Reuse**: Leverages existing CA analysis across services
3. **Professional UI**: Clean, modern interface with clear navigation
4. **Accessibility**: Proper labels, focus management, and error handling
5. **Scalability**: Easy to add new financial services to the hub