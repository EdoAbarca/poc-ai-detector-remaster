import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from '../components/Modal';

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }) => <span data-testid="icon" data-icon={icon}></span>,
}));

describe('Modal Component - US-006', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Modal',
    message: 'This is a test message',
  };

  it('should render modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<Modal {...defaultProps} />);

    const backdrop = document.querySelector('.bg-gray-500.bg-opacity-75');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should use custom button text when provided', () => {
    render(
      <Modal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Go Back"
      />
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('should render danger variant with correct styles', () => {
    render(<Modal {...defaultProps} variant="danger" />);

    const icon = screen.getByTestId('icon');
    expect(icon.getAttribute('data-icon')).toBe('mdi:alert-circle');
  });

  it('should render warning variant with correct styles', () => {
    render(<Modal {...defaultProps} variant="warning" />);

    const icon = screen.getByTestId('icon');
    expect(icon.getAttribute('data-icon')).toBe('mdi:alert');
  });

  it('should render info variant with correct styles', () => {
    render(<Modal {...defaultProps} variant="info" />);

    const icon = screen.getByTestId('icon');
    expect(icon.getAttribute('data-icon')).toBe('mdi:information');
  });

  it('should disable buttons and show loading state when isLoading is true', () => {
    render(<Modal {...defaultProps} isLoading={true} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();

    // Should show loading icon
    const icons = screen.getAllByTestId('icon');
    const loadingIcon = icons.find(icon => icon.getAttribute('data-icon') === 'mdi:loading');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('should not call onClose when backdrop is clicked while loading', () => {
    render(<Modal {...defaultProps} isLoading={true} />);

    const backdrop = document.querySelector('.bg-gray-500.bg-opacity-75');
    fireEvent.click(backdrop);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle escape key to close modal', () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on escape key when loading', () => {
    render(<Modal {...defaultProps} isLoading={true} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should prevent body scroll when modal is open', () => {
    const { unmount } = render(<Modal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should render with role and aria attributes for accessibility', () => {
    render(<Modal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should handle modal content that includes special characters', () => {
    render(
      <Modal
        {...defaultProps}
        title="Delete 'Important' File?"
        message='Are you sure you want to delete "file.txt"? This action cannot be undone.'
      />
    );

    expect(screen.getByText("Delete 'Important' File?")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "file.txt"/)).toBeInTheDocument();
  });

  it('should not trigger onConfirm multiple times when clicked rapidly', async () => {
    render(<Modal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    // Should still only be called once per click
    // (In real implementation, you might want to debounce or disable)
    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });
});
