import { extendTheme } from '@chakra-ui/react'
import { colors } from './colors'
import { breakpoints, space, sizes } from './foundations'
import { Button } from './components/Button'
import { Table } from './components/Table'

const theme = extendTheme({
  colors,
  breakpoints,
  space,
  sizes,
  components: {
    Button,
    Table,
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.900',
        fontSize: 'sm',
        lineHeight: 'base',
      },
      '*::placeholder': {
        color: 'gray.400',
      },
      '*, *::before, &::after': {
        borderColor: 'gray.200',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme