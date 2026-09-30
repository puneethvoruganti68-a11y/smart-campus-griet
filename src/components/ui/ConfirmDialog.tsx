'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100',
          buttonVariant: 'danger' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
          buttonVariant: 'primary' as const, // Amber button not standard, using primary
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          buttonVariant: 'primary' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideCloseButton
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full mx-auto sm:mx-0 ${styles.iconBg}`}>
          {styles.icon}
        </div>
        <div className="text-center sm:text-left mt-2 sm:mt-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {title}
          </h3>
          <div className="text-sm text-slate-500">
            {description}
          </div>
        </div>
      </div>
    </Modal>
  );
};
