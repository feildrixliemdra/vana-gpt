import React, { useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

// Add type for theme presets
interface ThemeVars {
  [key: string]: string;
}
interface ThemePreset {
  light: ThemeVars;
  dark: ThemeVars;
}
interface ThemePresets {
  [key: string]: ThemePreset;
}

const themePresets: ThemePresets = {
  default: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '0 0% 3.92%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 3.92%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 3.92%',
      '--primary': '0 0% 45.10%',
      '--primary-foreground': '0 0% 98.04%',
      '--secondary': '0 0% 96.08%',
      '--secondary-foreground': '0 0% 9.02%',
      '--muted': '0 0% 96.08%',
      '--muted-foreground': '0 0% 44.31%',
      '--accent': '0 0% 96.08%',
      '--accent-foreground': '0 0% 9.02%',
      '--destructive': '357.14 100% 45.29%',
      '--destructive-foreground': '0 0% 96.08%',
      '--border': '0 0% 89.80%',
      '--radius': '0.75rem',
      '--input': '0 0% 89.80%',
      '--ring': '0 0% 63.14%',
      '--chart-1': '0 0% 45.10%',
      '--chart-2': '0 0% 45.10%',
      '--chart-3': '0 0% 45.10%',
      '--chart-4': '0 0% 45.10%',
      '--chart-5': '0 0% 45.10%',
      '--sidebar': '0 0% 98.04%',
      '--sidebar-foreground': '0 0% 3.92%',
      '--sidebar-primary': '0 0% 9.02%',
      '--sidebar-primary-foreground': '0 0% 98.04%',
      '--sidebar-accent': '0 0% 96.08%',
      '--sidebar-accent-foreground': '0 0% 9.02%',
      '--sidebar-border': '0 0% 89.80%',
      '--sidebar-ring': '0 0% 63.14%',
      '--font-sans': "'Montserrat', sans-serif",
      '--font-serif': "'Montserrat', sans-serif",
      '--font-mono': "'Montserrat', sans-serif",
    },
    dark: {
      '--background': '0 0% 3.92%',
      '--foreground': '0 0% 98.04%',
      '--card': '0 0% 9.80%',
      '--card-foreground': '0 0% 98.04%',
      '--popover': '0 0% 14.90%',
      '--popover-foreground': '0 0% 98.04%',
      '--primary': '0 0% 45.10%',
      '--primary-foreground': '0 0% 98.04%',
      '--secondary': '0 0% 14.90%',
      '--secondary-foreground': '0 0% 98.04%',
      '--muted': '0 0% 14.90%',
      '--muted-foreground': '0 0% 63.14%',
      '--accent': '0 0% 25.10%',
      '--accent-foreground': '0 0% 98.04%',
      '--destructive': '358.84 100% 69.61%',
      '--destructive-foreground': '0 0% 14.90%',
      '--border': '0 0% 21.96%',
      '--radius': '0.75rem',
      '--input': '0 0% 32.16%',
      '--ring': '0 0% 45.10%',
      '--chart-1': '0 0% 45.10%',
      '--chart-2': '0 0% 45.10%',
      '--chart-3': '0 0% 45.10%',
      '--chart-4': '0 0% 45.10%',
      '--chart-5': '0 0% 45.10%',
      '--sidebar': '0 0% 9.02%',
      '--sidebar-foreground': '0 0% 98.04%',
      '--sidebar-primary': '0 0% 98.04%',
      '--sidebar-primary-foreground': '0 0% 9.02%',
      '--sidebar-accent': '0 0% 14.90%',
      '--sidebar-accent-foreground': '0 0% 98.04%',
      '--sidebar-border': '0 0% 100%',
      '--sidebar-ring': '0 0% 32.16%',
      '--font-sans': "'Montserrat', sans-serif",
      '--font-serif': "'Montserrat', sans-serif",
      '--font-mono': "'Montserrat', sans-serif",
    },
  },
  claude: {
    light: {
      '--background': '48 33.3333% 97.0588%',
      '--foreground': '48 19.6078% 20%',
      '--card': '48 33.3333% 97.0588%',
      '--card-foreground': '60 2.5641% 7.6471%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '50.7692 19.4030% 13.1373%',
      '--primary': '15.1111 55.5556% 52.3529%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '46.1538 22.8070% 88.8235%',
      '--secondary-foreground': '50.7692 8.4967% 30.0000%',
      '--muted': '44.0000 29.4118% 90%',
      '--muted-foreground': '50.0000 2.3622% 50.1961%',
      '--accent': '46.1538 22.8070% 88.8235%',
      '--accent-foreground': '50.7692 19.4030% 13.1373%',
      '--destructive': '60 2.5641% 7.6471%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '50 7.5000% 84.3137%',
      '--radius': '0.75rem',
      '--input': '50.7692 7.9755% 68.0392%',
      '--ring': '210 74.8031% 49.8039%',
      '--chart-1': '18.2813 57.1429% 43.9216%',
      '--chart-2': '251.4545 84.6154% 74.5098%',
      '--chart-3': '46.1538 28.2609% 81.9608%',
      '--chart-4': '256.5517 49.1525% 88.4314%',
      '--chart-5': '17.7778 60% 44.1176%',
      '--sidebar': '51.4286 25.9259% 94.7059%',
      '--sidebar-foreground': '60 2.5210% 23.3333%',
      '--sidebar-primary': '15.1111 55.5556% 52.3529%',
      '--sidebar-primary-foreground': '0 0% 98.4314%',
      '--sidebar-accent': '46.1538 22.8070% 88.8235%',
      '--sidebar-accent-foreground': '0 0% 20.3922%',
      '--sidebar-border': '0 0% 92.1569%',
      '--sidebar-ring': '0 0% 70.9804%',
      '--font-sans': "'Montserrat', sans-serif",
      '--font-serif': "'Montserrat', sans-serif",
      '--font-mono': "'Montserrat', sans-serif",
    },
    dark: {
      '--background': '60 2.7027% 14.5098%',
      '--foreground': '46.1538 9.7744% 73.9216%',
      '--card': '60 2.7027% 14.5098%',
      '--card-foreground': '48 33.3333% 97.0588%',
      '--popover': '60 2.1277% 18.4314%',
      '--popover-foreground': '60 5.4545% 89.2157%',
      '--primary': '14.7692 63.1068% 59.6078%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '48 33.3333% 97.0588%',
      '--secondary-foreground': '60 2.1277% 18.4314%',
      '--muted': '60 3.8462% 10.1961%',
      '--muted-foreground': '51.4286 8.8608% 69.0196%',
      '--accent': '48 10.6383% 9.2157%',
      '--accent-foreground': '51.4286 25.9259% 94.7059%',
      '--destructive': '0 84.2365% 60.1961%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '60 5.0847% 23.1373%',
      '--radius': '0.75rem',
      '--input': '52.5000 5.1282% 30.5882%',
      '--ring': '210 74.8031% 49.8039%',
      '--chart-1': '18.2813 57.1429% 43.9216%',
      '--chart-2': '251.4545 84.6154% 74.5098%',
      '--chart-3': '48 10.6383% 9.2157%',
      '--chart-4': '248.2759 25.2174% 22.5490%',
      '--chart-5': '17.7778 60% 44.1176%',
      '--sidebar': '30 3.3333% 11.7647%',
      '--sidebar-foreground': '46.1538 9.7744% 73.9216%',
      '--sidebar-primary': '0 0% 20.3922%',
      '--sidebar-primary-foreground': '0 0% 98.4314%',
      '--sidebar-accent': '60 3.4483% 5.6863%',
      '--sidebar-accent-foreground': '46.1538 9.7744% 73.9216%',
      '--sidebar-border': '0 0% 92.1569%',
      '--sidebar-ring': '0 0% 70.9804%',
      '--font-sans': "'Montserrat', sans-serif",
      '--font-serif': "'Montserrat', sans-serif",
      '--font-mono': "'Montserrat', sans-serif",
    },
  },
  notebook: {
    light: {
      '--background': '0 0% 97.6471%',
      '--foreground': '0 0% 22.7451%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 22.7451%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 22.7451%',
      '--primary': '0 0% 37.6471%',
      '--primary-foreground': '0 0% 94.1176%',
      '--secondary': '0 0% 87.0588%',
      '--secondary-foreground': '0 0% 22.7451%',
      '--muted': '0 0% 89.0196%',
      '--muted-foreground': '0 0% 31.3725%',
      '--accent': '47.4419 64.1791% 86.8627%',
      '--accent-foreground': '14.2105 25.6757% 29.0196%',
      '--destructive': '0 41.4894% 63.1373%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '0 0.8696% 45.0980%',
      '--input': '0 0% 100%',
      '--ring': '0 0% 62.7451%',
      '--chart-1': '0 0% 20%',
      '--chart-2': '0 0% 33.3333%',
      '--chart-3': '0 0% 46.6667%',
      '--chart-4': '0 0% 60%',
      '--chart-5': '0 0% 73.3333%',
      '--sidebar': '0 0% 94.1176%',
      '--sidebar-foreground': '0 0% 22.7451%',
      '--sidebar-primary': '0 0% 37.6471%',
      '--sidebar-primary-foreground': '0 0% 94.1176%',
      '--sidebar-accent': '47.4419 64.1791% 86.8627%',
      '--sidebar-accent-foreground': '14.2105 25.6757% 29.0196%',
      '--sidebar-border': '0 0% 75.2941%',
      '--sidebar-ring': '0 0% 62.7451%',
      '--font-sans': 'Architects Daughter, sans-serif',
      '--font-serif': '"Times New Roman", Times, serif',
      '--font-mono': '"Courier New", Courier, monospace',
      '--radius': '0.625rem',
      '--shadow-2xs': '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
      '--shadow-xs': '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
      '--shadow-sm':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
      '--shadow':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-md':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-lg':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-xl':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-2xl': '1px 4px 5px 0px hsl(0 0% 0% / 0.07)',
      '--tracking-normal': '0.5px',
    },
    dark: {
      '--background': '0 0% 16.8627%',
      '--foreground': '0 0% 86.2745%',
      '--card': '0 0% 20%',
      '--card-foreground': '0 0% 86.2745%',
      '--popover': '0 0% 20%',
      '--popover-foreground': '0 0% 86.2745%',
      '--primary': '0 0% 69.0196%',
      '--primary-foreground': '0 0% 16.8627%',
      '--secondary': '0 0% 35.2941%',
      '--secondary-foreground': '0 0% 75.2941%',
      '--muted': '0 0% 27.0588%',
      '--muted-foreground': '0 0% 62.7451%',
      '--accent': '0 0% 87.8431%',
      '--accent-foreground': '0 0% 20%',
      '--destructive': '0 35.5932% 76.8627%',
      '--destructive-foreground': '0 0% 16.8627%',
      '--border': '0 0% 30.9804%',
      '--input': '0 0% 20%',
      '--ring': '0 0% 75.2941%',
      '--chart-1': '0 0% 93.7255%',
      '--chart-2': '0 0% 81.5686%',
      '--chart-3': '0 0% 69.0196%',
      '--chart-4': '0 0% 56.4706%',
      '--chart-5': '0 0% 43.9216%',
      '--sidebar': '0 0% 12.9412%',
      '--sidebar-foreground': '0 0% 86.2745%',
      '--sidebar-primary': '0 0% 69.0196%',
      '--sidebar-primary-foreground': '0 0% 12.9412%',
      '--sidebar-accent': '0 0% 87.8431%',
      '--sidebar-accent-foreground': '0 0% 20%',
      '--sidebar-border': '0 0% 30.9804%',
      '--sidebar-ring': '0 0% 75.2941%',
      '--font-sans': 'Architects Daughter, sans-serif',
      '--font-serif': 'Georgia, serif',
      '--font-mono': '"Fira Code", "Courier New", monospace',
      '--radius': '0.625rem',
      '--shadow-2xs': '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
      '--shadow-xs': '1px 4px 5px 0px hsl(0 0% 0% / 0.01)',
      '--shadow-sm':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
      '--shadow':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-md':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-lg':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-xl':
        '1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03)',
      '--shadow-2xl': '1px 4px 5px 0px hsl(0 0% 0% / 0.07)',
    },
  },
  cyberpunk: {
    light: {
      '--background': '210 16.6667% 97.6471%',
      '--foreground': '240 41.4634% 8.0392%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 41.4634% 8.0392%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 41.4634% 8.0392%',
      '--primary': '312.9412 100% 50%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 100% 97.0588%',
      '--secondary-foreground': '240 41.4634% 8.0392%',
      '--muted': '240 100% 97.0588%',
      '--muted-foreground': '240 41.4634% 8.0392%',
      '--accent': '168 100% 50%',
      '--accent-foreground': '240 41.4634% 8.0392%',
      '--destructive': '14.3529 100% 50%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '198.0000 18.5185% 89.4118%',
      '--input': '198.0000 18.5185% 89.4118%',
      '--ring': '312.9412 100% 50%',
      '--chart-1': '312.9412 100% 50%',
      '--chart-2': '273.8824 100% 50%',
      '--chart-3': '186.1176 100% 50%',
      '--chart-4': '168 100% 50%',
      '--chart-5': '54.1176 100% 50%',
      '--sidebar': '240 100% 97.0588%',
      '--sidebar-foreground': '240 41.4634% 8.0392%',
      '--sidebar-primary': '312.9412 100% 50%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '168 100% 50%',
      '--sidebar-accent-foreground': '240 41.4634% 8.0392%',
      '--sidebar-border': '198.0000 18.5185% 89.4118%',
      '--sidebar-ring': '312.9412 100% 50%',
      '--font-sans': 'Outfit, sans-serif',
      '--font-serif':
        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      '--font-mono': 'Fira Code, monospace',
      '--radius': '0.5rem',
      '--shadow-2xs': '0px 4px 8px -2px hsl(0 0% 0% / 0.05)',
      '--shadow-xs': '0px 4px 8px -2px hsl(0 0% 0% / 0.05)',
      '--shadow-sm':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)',
      '--shadow':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-md':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 2px 4px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-lg':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 4px 6px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-xl':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 8px 10px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-2xl': '0px 4px 8px -2px hsl(0 0% 0% / 0.25)',
    },
    dark: {
      '--background': '240 41.4634% 8.0392%',
      '--foreground': '217.5000 26.6667% 94.1176%',
      '--card': '240 35.4839% 18.2353%',
      '--card-foreground': '217.5000 26.6667% 94.1176%',
      '--popover': '240 35.4839% 18.2353%',
      '--popover-foreground': '217.5000 26.6667% 94.1176%',
      '--primary': '312.9412 100% 50%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 35.4839% 18.2353%',
      '--secondary-foreground': '217.5000 26.6667% 94.1176%',
      '--muted': '240 35.4839% 18.2353%',
      '--muted-foreground': '232.1053 17.5926% 57.6471%',
      '--accent': '168 100% 50%',
      '--accent-foreground': '240 41.4634% 8.0392%',
      '--destructive': '14.3529 100% 50%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '240 34.2857% 27.4510%',
      '--input': '240 34.2857% 27.4510%',
      '--ring': '312.9412 100% 50%',
      '--chart-1': '312.9412 100% 50%',
      '--chart-2': '273.8824 100% 50%',
      '--chart-3': '186.1176 100% 50%',
      '--chart-4': '168 100% 50%',
      '--chart-5': '54.1176 100% 50%',
      '--sidebar': '240 41.4634% 8.0392%',
      '--sidebar-foreground': '217.5000 26.6667% 94.1176%',
      '--sidebar-primary': '312.9412 100% 50%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '168 100% 50%',
      '--sidebar-accent-foreground': '240 41.4634% 8.0392%',
      '--sidebar-border': '240 34.2857% 27.4510%',
      '--sidebar-ring': '312.9412 100% 50%',
      '--font-sans': 'Outfit, sans-serif',
      '--font-serif':
        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      '--font-mono': 'Fira Code, monospace',
      '--radius': '0.5rem',
      '--shadow-2xs': '0px 4px 8px -2px hsl(0 0% 0% / 0.05)',
      '--shadow-xs': '0px 4px 8px -2px hsl(0 0% 0% / 0.05)',
      '--shadow-sm':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)',
      '--shadow':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-md':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 2px 4px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-lg':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 4px 6px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-xl':
        '0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 8px 10px -3px hsl(0 0% 0% / 0.10)',
      '--shadow-2xl': '0px 4px 8px -2px hsl(0 0% 0% / 0.25)',
    },
  },
  tangerine: {
    light: {
      '--background': '204.0000 12.1951% 91.9608%',
      '--foreground': '0 0% 20%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 20%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 20%',
      '--primary': '13.2143 73.0435% 54.9020%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220.0000 14.2857% 95.8824%',
      '--secondary-foreground': '215 13.7931% 34.1176%',
      '--muted': '210 20.0000% 98.0392%',
      '--muted-foreground': '220 8.9362% 46.0784%',
      '--accent': '207.6923 46.4286% 89.0196%',
      '--accent-foreground': '224.4444 64.2857% 32.9412%',
      '--destructive': '0 84.2365% 60.1961%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '210 9.3750% 87.4510%',
      '--input': '220 15.7895% 96.2745%',
      '--ring': '13.2143 73.0435% 54.9020%',
      '--chart-1': '210 37.5000% 65.4902%',
      '--chart-2': '12.9032 73.2283% 75.0980%',
      '--chart-3': '213.1579 29.9213% 50.1961%',
      '--chart-4': '216.9231 35.7798% 42.7451%',
      '--chart-5': '221.0127 43.6464% 35.4902%',
      '--sidebar': '216 7.9365% 87.6471%',
      '--sidebar-foreground': '0 0% 20%',
      '--sidebar-primary': '13.2143 73.0435% 54.9020%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '207.6923 46.4286% 89.0196%',
      '--sidebar-accent-foreground': '224.4444 64.2857% 32.9412%',
      '--sidebar-border': '220 13.0435% 90.9804%',
      '--sidebar-ring': '13.2143 73.0435% 54.9020%',
      '--font-sans': 'Inter, sans-serif',
      '--font-serif': 'Source Serif 4, serif',
      '--font-mono': 'JetBrains Mono, monospace',
      '--radius': '0.75rem',
      '--shadow-2xs': '0px 1px 3px 0px hsl(0 0% 0% / 0.05)',
      '--shadow-xs': '0px 1px 3px 0px hsl(0 0% 0% / 0.05)',
      '--shadow-sm':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)',
      '--shadow':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-md':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-lg':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-xl':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-2xl': '0px 1px 3px 0px hsl(0 0% 0% / 0.25)',
    },
    dark: {
      '--background': '219.1304 29.1139% 15.4902%',
      '--foreground': '0 0% 89.8039%',
      '--card': '223.6364 20.7547% 20.7843%',
      '--card-foreground': '0 0% 89.8039%',
      '--popover': '223.3333 19.1489% 18.4314%',
      '--popover-foreground': '0 0% 89.8039%',
      '--primary': '13.2143 73.0435% 54.9020%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '222 19.2308% 20.3922%',
      '--secondary-foreground': '0 0% 89.8039%',
      '--muted': '222 19.2308% 20.3922%',
      '--muted-foreground': '0 0% 63.9216%',
      '--accent': '223.6364 34.3750% 25.0980%',
      '--accent-foreground': '213.3333 96.9231% 87.2549%',
      '--destructive': '0 84.2365% 60.1961%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '224.3478 15.8621% 28.4314%',
      '--input': '224.3478 15.8621% 28.4314%',
      '--ring': '13.2143 73.0435% 54.9020%',
      '--chart-1': '210 37.5000% 65.4902%',
      '--chart-2': '11.7241 63.5036% 73.1373%',
      '--chart-3': '213.1579 29.9213% 50.1961%',
      '--chart-4': '216.9231 35.7798% 42.7451%',
      '--chart-5': '221.0127 43.6464% 35.4902%',
      '--sidebar': '222.8571 20.0000% 20.5882%',
      '--sidebar-foreground': '0 0% 89.8039%',
      '--sidebar-primary': '13.2143 73.0435% 54.9020%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '223.6364 34.3750% 25.0980%',
      '--sidebar-accent-foreground': '213.3333 96.9231% 87.2549%',
      '--sidebar-border': '224.3478 15.8621% 28.4314%',
      '--sidebar-ring': '13.2143 73.0435% 54.9020%',
      '--font-sans': 'Inter, sans-serif',
      '--font-serif': 'Source Serif 4, serif',
      '--font-mono': 'JetBrains Mono, monospace',
      '--radius': '0.75rem',
      '--shadow-2xs': '0px 1px 3px 0px hsl(0 0% 0% / 0.05)',
      '--shadow-xs': '0px 1px 3px 0px hsl(0 0% 0% / 0.05)',
      '--shadow-sm':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)',
      '--shadow':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-md':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-lg':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-xl':
        '0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)',
      '--shadow-2xl': '0px 1px 3px 0px hsl(0 0% 0% / 0.25)',
    },
  },
  twitter: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '210 25% 7.8431%',
      '--card': '180 6.6667% 97.0588%',
      '--card-foreground': '210 25% 7.8431%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '210 25% 7.8431%',
      '--primary': '203.8863 88.2845% 53.1373%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '210 25% 7.8431%',
      '--secondary-foreground': '0 0% 100%',
      '--muted': '240 1.9608% 90%',
      '--muted-foreground': '210 25% 7.8431%',
      '--accent': '211.5789 51.3514% 92.7451%',
      '--accent-foreground': '203.8863 88.2845% 53.1373%',
      '--destructive': '356.3033 90.5579% 54.3137%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '201.4286 30.4348% 90.9804%',
      '--input': '200 23.0769% 97.4510%',
      '--ring': '202.8169 89.1213% 53.1373%',
      '--chart-1': '203.8863 88.2845% 53.1373%',
      '--chart-2': '159.7826 100% 36.0784%',
      '--chart-3': '42.0290 92.8251% 56.2745%',
      '--chart-4': '147.1429 78.5047% 41.9608%',
      '--chart-5': '341.4894 75.2000% 50.9804%',
      '--sidebar': '180 6.6667% 97.0588%',
      '--sidebar-foreground': '210 25% 7.8431%',
      '--sidebar-primary': '203.8863 88.2845% 53.1373%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '211.5789 51.3514% 92.7451%',
      '--sidebar-accent-foreground': '203.8863 88.2845% 53.1373%',
      '--sidebar-border': '205.0000 25.0000% 90.5882%',
      '--sidebar-ring': '202.8169 89.1213% 53.1373%',
      '--font-sans': 'Open Sans, sans-serif',
      '--font-serif': 'Georgia, serif',
      '--font-mono': 'Menlo, monospace',
      '--radius': '1.3rem',
      '--shadow-2xs': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-xs': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-sm':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-md':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-lg':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-xl':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-2xl': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
    },
    dark: {
      '--background': '0 0% 0%',
      '--foreground': '200 6.6667% 91.1765%',
      '--card': '228 9.8039% 10%',
      '--card-foreground': '0 0% 85.0980%',
      '--popover': '0 0% 0%',
      '--popover-foreground': '200 6.6667% 91.1765%',
      '--primary': '203.7736 87.6033% 52.5490%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '195.0000 15.3846% 94.9020%',
      '--secondary-foreground': '210 25% 7.8431%',
      '--muted': '0 0% 9.4118%',
      '--muted-foreground': '210 3.3898% 46.2745%',
      '--accent': '205.7143 70% 7.8431%',
      '--accent-foreground': '203.7736 87.6033% 52.5490%',
      '--destructive': '356.3033 90.5579% 54.3137%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '210 5.2632% 14.9020%',
      '--input': '207.6923 27.6596% 18.4314%',
      '--ring': '202.8169 89.1213% 53.1373%',
      '--chart-1': '203.8863 88.2845% 53.1373%',
      '--chart-2': '159.7826 100% 36.0784%',
      '--chart-3': '42.0290 92.8251% 56.2745%',
      '--chart-4': '147.1429 78.5047% 41.9608%',
      '--chart-5': '341.4894 75.2000% 50.9804%',
      '--sidebar': '228 9.8039% 10%',
      '--sidebar-foreground': '0 0% 85.0980%',
      '--sidebar-primary': '202.8169 89.1213% 53.1373%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '205.7143 70% 7.8431%',
      '--sidebar-accent-foreground': '203.7736 87.6033% 52.5490%',
      '--sidebar-border': '205.7143 15.7895% 26.0784%',
      '--sidebar-ring': '202.8169 89.1213% 53.1373%',
      '--font-sans': 'Open Sans, sans-serif',
      '--font-serif': 'Georgia, serif',
      '--font-mono': 'Menlo, monospace',
      '--radius': '1.3rem',
      '--shadow-2xs': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-xs': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-sm':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-md':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-lg':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-xl':
        '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)',
      '--shadow-2xl': '0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)',
    },
  },
};

function applyTheme(themeName: string, isDark: boolean) {
  const theme = themePresets[themeName];
  if (!theme) return;
  const vars = isDark ? theme.dark : theme.light;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeSelector() {
  const [selected, setSelected] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedTheme');
      return typeof stored === 'string' ? stored : 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(selected, isDark);
    localStorage.setItem('selectedTheme', selected);
  }, [selected]);

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(selected, isDark);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [selected]);

  return (
    <Select value={selected} onValueChange={setSelected}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SelectTrigger className="w-[140px] md:px-2 md:h-[34px] data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:bg-accent hover:text-accent-foreground">
            <SelectValue>
              {selected.charAt(0).toUpperCase() + selected.slice(1)}
            </SelectValue>
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent>Select Theme</TooltipContent>
      </Tooltip>
      <SelectContent>
        <SelectItem value="default">Default</SelectItem>
        <SelectItem value="claude">Claude</SelectItem>
        <SelectItem value="notebook">Notebook</SelectItem>
        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
        <SelectItem value="tangerine">Tangerine</SelectItem>
        <SelectItem value="twitter">Twitter</SelectItem>
      </SelectContent>
    </Select>
  );
}
