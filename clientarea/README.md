# Chatvolution Client

## Technology

[Reactjs](https://reactjs.org/).
[ChakraUi](https://chakra-ui.com/).
[Socket Io](https://socket.io/).

## Note From Developer

1. if you update package chakra ui, please copy directory css-reset on directory backup
   to node_modules/@chakra-ui
   reason: because on production, i customize package chakra-ui,to support with needs condition
2. if you use chakra ui without css-reset from chakra ui,
   please copy directory dist on directory backup/css-reset-customize to node_modules
   @chakra-ui/css-reset
3. Remove global style from :
   - \@chakra-ui\theme\dist\chakra-ui-theme.cjs.dev.js
   - \@chakra-ui\theme\dist\chakra-ui-theme.cjs.prod.js
   - \@chakra-ui\theme\dist\chakra-ui-theme.esm.js

note from me : if confused, please ask google or community thanks!
