import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from 'src/components/common/DropdownMenu';
import { useThemeStore, type Theme } from 'src/stores/themeStore';

/** Light/dark/system picker — persisted via `themeStore`, applied by `useThemeSync`. */
export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { t } = useTranslation();
  const THEME_LABELS: Record<Theme, string> = {
    light: t('THEME_LIGHT'),
    dark: t('THEME_DARK'),
    system: t('THEME_SYSTEM'),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={t('LABEL_THEME_TOGGLE')}>
          {THEME_LABELS[theme]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value as Theme);
          }}
        >
          {(Object.keys(THEME_LABELS) as Theme[]).map((value) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {THEME_LABELS[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
