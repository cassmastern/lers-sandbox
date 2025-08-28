document$.subscribe(() => {
  const isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';

  const commonVars = {
    'fontFamily': 'sans-serif',
    'fontSize': 14,
    'fontWeight': 'normal',
    'securityLevel': 'strict'
  };

  const lightThemeVars = {
    'lineColor': '#333333',
    'sequenceArrowFill': '#333333',
    'sequenceArrowStroke': '#333333',
    'textColor': '#000000',
    'actorTextColor': '#000000',
    'actorBorder': '#555555'
  };

  const darkThemeVars = {
    'lineColor': '#eeeeee',
    'sequenceArrowFill': '#eeeeee',
    'sequenceArrowStroke': '#eeeeee',
    'textColor': '#ffffff',
    'actorTextColor': '#eeeeee',
    'actorBorder': '#aaaaaa'
  };

  const themeVariables = isDarkMode ? { ...commonVars, ...darkThemeVars } : { ...commonVars, ...lightThemeVars };

  mermaid.initialize({
    theme: isDarkMode ? 'dark' : 'default',
    themeVariables: themeVariables
  });
});
