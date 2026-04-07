/**
 * Paleta de Cores do Projeto TCC
 * 
 * Este arquivo contém as definições das cores utilizadas no projeto,
 * seguindo uma paleta consistente e profissional.
 */

export const colors = {
  // Cor Principal
  turquoise: {
    DEFAULT: '#00C2A8',
    light: '#33CFB7',
    lighter: '#66DBC9',
    lightest: '#99E7DB',
    dark: '#009B86',
    darker: '#007465',
    darkest: '#004D43',
  },

  // Cor Secundária - Azul Escuro
  darkBlue: {
    DEFAULT: '#003B4A',
    light: '#338797',
    lighter: '#66A5B1',
    lightest: '#99C3CB',
    dark: '#002F3B',
    darker: '#00232C',
    darkest: '#00171D',
  },

  // Verde Claro - Tons Suaves
  lightGreen: {
    DEFAULT: '#A7F0E0',
    light: '#87EFBF',
    lighter: '#A5F3CF',
    lightest: '#C3F7DF',
    dark: '#85C0B0',
    darker: '#639080',
    darkest: '#416050',
  },

  // Cores Neutras
  white: '#FFFFFF',
  
  lightGray: '#F5F7F8',
  mediumGray: '#6C757D',
  darkGray: '#212529',

  // Cor de Apoio - Alertas/Atenção
  coral: {
    DEFAULT: '#FF7043',
    light: '#FFA78F',
    lighter: '#FFBDAB',
    lightest: '#FFD3C7',
    dark: '#CC5936',
    darker: '#994228',
    darkest: '#662B1B',
  },
} as const;

/**
 * Mapa de uso das cores por contexto
 */
export const colorUsage = {
  // Uso Principal - Turquesa
  primary: colors.turquoise.DEFAULT,
  logo: colors.turquoise.DEFAULT,
  actionButtons: colors.turquoise.DEFAULT,
  highlights: colors.turquoise.DEFAULT,

  // Uso Secundário - Azul Escuro
  headers: colors.darkBlue.DEFAULT,
  footer: colors.darkBlue.DEFAULT,
  menus: colors.darkBlue.DEFAULT,
  contrast: colors.darkBlue.DEFAULT,

  // Fundos Suaves - Verde Claro
  lightBackgrounds: colors.lightGreen.DEFAULT,
  subtleAccents: colors.lightGreen.lightest,

  // Neutras
  mainBackground: colors.white,
  cardBackgrounds: colors.lightGray,
  secondaryText: colors.mediumGray,
  primaryText: colors.darkGray,

  // Alertas
  alerts: colors.coral.DEFAULT,
  notifications: colors.coral.DEFAULT,
  promotions: colors.coral.DEFAULT,
} as const;

/**
 * Classes CSS para uso com Tailwind
 */
export const colorClasses = {
  turquoise: 'text-turquoise bg-turquoise border-turquoise',
  darkBlue: 'text-dark-blue bg-dark-blue border-dark-blue',
  lightGreen: 'text-light-green bg-light-green border-light-green',
  coral: 'text-coral bg-coral border-coral',
  white: 'text-white bg-white border-white',
  lightGray: 'text-light-gray bg-light-gray border-light-gray',
  mediumGray: 'text-medium-gray bg-medium-gray border-medium-gray',
  darkGray: 'text-dark-gray bg-dark-gray border-dark-gray',
} as const;

export default colors;
