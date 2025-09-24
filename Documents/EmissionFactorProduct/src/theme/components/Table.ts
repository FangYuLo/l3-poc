export const Table = {
  variants: {
    simple: {
      th: {
        bg: 'table.header',
        borderBottom: '2px solid',
        borderColor: 'table.border',
        color: 'gray.600',
        fontSize: 'sm',
        fontWeight: 'semibold',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        py: 3,
        px: 4,
      },
      td: {
        borderBottom: '1px solid',
        borderColor: 'table.border',
        py: 3,
        px: 4,
      },
      tbody: {
        tr: {
          _hover: {
            bg: 'table.hover',
          },
        },
      },
    },
    striped: {
      th: {
        bg: 'table.header',
        borderBottom: '2px solid',
        borderColor: 'table.border',
        color: 'gray.600',
        fontSize: 'sm',
        fontWeight: 'semibold',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        py: 3,
        px: 4,
      },
      td: {
        borderBottom: '1px solid',
        borderColor: 'table.border',
        py: 3,
        px: 4,
      },
      tbody: {
        tr: {
          '&:nth-of-type(odd)': {
            bg: 'gray.50',
          },
          _hover: {
            bg: 'table.hover',
          },
        },
      },
    },
  },
  sizes: {
    sm: {
      th: {
        px: 2,
        py: 2,
        fontSize: 'xs',
      },
      td: {
        px: 2,
        py: 2,
        fontSize: 'sm',
      },
    },
    md: {
      th: {
        px: 4,
        py: 3,
        fontSize: 'sm',
      },
      td: {
        px: 4,
        py: 3,
        fontSize: 'md',
      },
    },
    lg: {
      th: {
        px: 6,
        py: 4,
        fontSize: 'md',
      },
      td: {
        px: 6,
        py: 4,
        fontSize: 'lg',
      },
    },
  },
  defaultProps: {
    variant: 'simple',
    size: 'md',
  },
}