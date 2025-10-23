import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stock } from "@/types/trading";
import { Building2, TrendingUp, Calendar } from "lucide-react";

interface CompanyInfoDialogProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
}

const companyInfo: Record<string, { sector: string; description: string; founded: string }> = {
  'RELIANCE.BSE': {
    sector: 'Conglomerate',
    description: 'Reliance Industries is an Indian multinational conglomerate, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, and mass media.',
    founded: '1973'
  },
  'TCS.BSE': {
    sector: 'IT Services',
    description: 'Tata Consultancy Services is an Indian multinational IT services and consulting company. It is a subsidiary of the Tata Group and operates in 46 countries.',
    founded: '1968'
  },
  'HDFCBANK.BSE': {
    sector: 'Banking',
    description: 'HDFC Bank is an Indian banking and financial services company. It is the largest private sector bank in India by assets and market capitalization.',
    founded: '1994'
  },
  'INFY.BSE': {
    sector: 'IT Services',
    description: 'Infosys is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
    founded: '1981'
  },
  'HINDUNILVR.BSE': {
    sector: 'FMCG',
    description: 'Hindustan Unilever is an Indian consumer goods company headquartered in Mumbai. It is a subsidiary of Unilever and manufactures consumer goods ranging from soaps to food products.',
    founded: '1933'
  },
  'ICICIBANK.BSE': {
    sector: 'Banking',
    description: 'ICICI Bank is an Indian multinational bank and financial services company. It is the second largest bank in India by assets and market capitalization.',
    founded: '1994'
  },
  'BHARTIARTL.BSE': {
    sector: 'Telecommunications',
    description: 'Bharti Airtel is an Indian multinational telecommunications services company. It operates in 18 countries across South Asia and Africa.',
    founded: '1995'
  },
  'ITC.BSE': {
    sector: 'Conglomerate',
    description: 'ITC Limited is an Indian conglomerate with businesses in FMCG, hotels, packaging, paperboards, specialty papers and agri-business.',
    founded: '1910'
  },
  'SBIN.BSE': {
    sector: 'Banking',
    description: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body. It is the largest bank in India with a market share of 23%.',
    founded: '1955'
  },
  'LT.BSE': {
    sector: 'Engineering & Construction',
    description: 'Larsen & Toubro is an Indian multinational engaged in EPC projects, hi-tech manufacturing and services. It operates in over 50 countries.',
    founded: '1938'
  }
};

export const CompanyInfoDialog = ({ stock, isOpen, onClose }: CompanyInfoDialogProps) => {
  if (!stock) return null;

  const info = companyInfo[stock.symbol] || {
    sector: 'Unknown',
    description: 'Company information not available.',
    founded: 'N/A'
  };

  const isPositive = stock.change >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">{stock.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Symbol</p>
              <p className="text-lg font-semibold text-foreground">{stock.symbol}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg font-semibold text-foreground">
                ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Today's Change</p>
              <p className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Sector</p>
                <p className="text-sm text-muted-foreground">{info.sector}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Founded</p>
                <p className="text-sm text-muted-foreground">{info.founded}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
