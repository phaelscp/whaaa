import React from "react";

const ColorModeContext = React.createContext({
    toggleColorMode: () => { },
    setPrimaryColorLight: (_) => { },
    setPrimaryColorDark: (_) => { },
    setAppLogoLight: (_) => { },
    setAppLogoDark: (_) => { },
    setAppLogoFavicon: (_) => { },
    setChatlistLight: (_) => { },
    setChatlistDark: (_) => { },
    setBoxLeftLight: (_) => { },
    setBoxLeftDark: (_) => { },
    setBoxRightLight: (_) => { },
    setBoxRightDark: (_) => { },
  });

export default ColorModeContext;