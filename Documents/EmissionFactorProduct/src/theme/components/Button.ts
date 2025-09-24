export const Button = {
  variants: {
    ghost: {
      bg: 'transparent',
      _hover: {
        bg: 'gray.100',
      },
      _active: {
        bg: 'gray.200',
      },
    },
    outline: {
      border: '1px solid',
      borderColor: 'gray.200',
      _hover: {
        bg: 'gray.50',
      },
    },
    solid: {
      bg: 'brand.500',
      color: 'white',
      _hover: {
        bg: 'brand.600',
      },
      _active: {
        bg: 'brand.700',
      },
    },
    primary: {
      bg: 'brand.500',
      color: 'white',
      _hover: {
        bg: 'brand.600',
      },
      _active: {
        bg: 'brand.700',
      },
    },
    success: {
      bg: 'success.500',
      color: 'white',
      _hover: {
        bg: 'success.600',
      },
    },
    warning: {
      bg: 'warning.500',
      color: 'white',
      _hover: {
        bg: 'warning.600',
      },
    },
  },
  sizes: {
    xs: {
      h: 6,
      minW: 6,
      fontSize: 'xs',
      px: 2,
    },
    sm: {
      h: 8,
      minW: 8,
      fontSize: 'sm',
      px: 3,
    },
    md: {
      h: 10,
      minW: 10,
      fontSize: 'md',
      px: 4,
    },
    lg: {
      h: 12,
      minW: 12,
      fontSize: 'lg',
      px: 6,
    },
  },
  defaultProps: {
    variant: 'solid',
    size: 'md',
  },
}