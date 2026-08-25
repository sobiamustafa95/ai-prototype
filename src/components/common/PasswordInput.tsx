import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { Button } from 'src/components/common/Button';
import { cn } from 'src/lib/utils';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
}

/** Text input with a show/hide toggle — wraps the common `Input`, same a11y contract. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();
    const toggleLabel = visible ? t('LABEL_PASSWORD_HIDE') : t('LABEL_PASSWORD_SHOW');

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-12', className)}
          {...rest}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-7 right-1 px-2"
          aria-label={toggleLabel}
          onClick={() => setVisible((current) => !current)}
        >
          {toggleLabel}
        </Button>
      </div>
    );
  }
);
