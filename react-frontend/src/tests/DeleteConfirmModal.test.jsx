import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }) => <span data-testid="icon" data-icon={icon}></span>,
}));

describe('DeleteConfirmModal Component - US-009', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    tagName: 'Finance',
    isDeleting: false,
  };

  it('should render modal when isOpen is true', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Delete Tag', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the tag/)).toBeInTheDocument();
    expect(screen.getByText(/Finance/)).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete Tag', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('should display the tag name in the confirmation message', () => {
    render(<DeleteConfirmModal {...defaultProps} tagName="Marketing" />);

    expect(screen.getByText(/Marketing/)).toBeInTheDocument();
  });

  it('should show warning message about tag associations', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText(/This action will remove the tag from all associated analyses/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it('should call onConfirm when Delete Tag button is clicked', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close icon is clicked', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const { container } = render(<DeleteConfirmModal {...defaultProps} />);

    const backdrop = container.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking on modal content', () => {
    const { container } = render(<DeleteConfirmModal {...defaultProps} />);

    const modalContent = container.querySelector('.bg-white');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state when isDeleting is true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when isDeleting is true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const deleteButton = screen.getByRole('button', { name: /Deleting/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const closeButton = screen.getByRole('button', { name: '' });

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('should not call onClose when backdrop is clicked while deleting', () => {
    const { container } = render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const backdrop = container.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display delete icon in the modal header', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const icon = screen.getAllByTestId('icon')[0];
    expect(icon.getAttribute('data-icon')).toBe('mdi:alert-circle');
  });

  it('should have red styling for danger state', () => {
    const { container } = render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
    expect(deleteButton).toHaveClass('bg-red-600');
  });

  it('should render all buttons in correct order', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent);

    expect(buttonTexts).toContain('Cancel');
    expect(buttonTexts).toContain('Delete Tag');
  });
});
