import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateScanModal from '../components/CreateScanModal';

// Mock Toastify
vi.mock('toastify-js', () => ({
  default: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}));

describe('CreateScanModal', () => {
  const mockOnClose = vi.fn();
  const mockOnScanCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    expect(screen.getByText('Create New Scan')).toBeInTheDocument();
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Scan Configuration')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <CreateScanModal
        isOpen={false}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    expect(screen.queryByText('Create New Scan')).not.toBeInTheDocument();
  });

  it('should show validation error when title is empty', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/title is required|title must be at least 3 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should show validation error when no documents are uploaded', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one document is required')).toBeInTheDocument();
    });
  });

  it('should validate file type - reject invalid file types', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    // Create a mock file with invalid type
    const invalidFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]');

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Only PDF, DOCX, and TXT files are allowed')).toBeInTheDocument();
    });
  });

  it('should validate file size - reject files over 10MB', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    // Create a mock file that's too large (11MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    
    // Mock the size property
    Object.defineProperty(largeFile, 'size', {
      value: 11 * 1024 * 1024,
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Each file must be less than 10MB')).toBeInTheDocument();
    });
  });

  it('should accept valid PDF file', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    // Create a valid PDF file
    const validFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', {
      value: 1024 * 1024, // 1MB
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');

    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('Ready to upload (1)')).toBeInTheDocument();
    });
  });

  it('should accept valid DOCX file', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const validFile = new File(['docx content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    Object.defineProperty(validFile, 'size', {
      value: 1024 * 1024, // 1MB
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');

    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.docx')).toBeInTheDocument();
    });
  });

  it('should accept valid TXT file', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const validFile = new File(['text content'], 'test.txt', {
      type: 'text/plain',
    });
    Object.defineProperty(validFile, 'size', {
      value: 1024, // 1KB
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');

    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('should allow removing uploaded files', async () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', {
      value: 1024,
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Find and click the remove button
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(
      (btn) => btn.querySelector('[class*="mdi:close"]')
    );

    if (removeButton) {
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      });
    }
  });

  it('should allow selecting AI providers', () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const gpt4Label = screen.getByLabelText(/GPT-4/i);
    const gpt4Checkbox = gpt4Label.querySelector('input[type="checkbox"]') || gpt4Label;
    fireEvent.click(gpt4Checkbox);

    expect(gpt4Checkbox.checked).toBe(true);
  });

  it('should allow selecting tags', () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const academicLabel = screen.getByLabelText(/Academic/i);
    const academicCheckbox = academicLabel.querySelector('input[type="checkbox"]') || academicLabel;
    fireEvent.click(academicCheckbox);

    expect(academicCheckbox.checked).toBe(true);
  });

  it('should close modal when Cancel button is clicked', () => {
    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, title: 'Test Scan' }),
      })
    );

    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    // Fill in title
    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    // Add a file
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', {
      value: 1024,
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Select an AI provider
    const gpt4Label = screen.getByLabelText(/GPT-4/i);
    const gpt4Checkbox = gpt4Label.querySelector('input[type="checkbox"]') || gpt4Label;
    fireEvent.click(gpt4Checkbox);

    // Select a tag
    const academicLabel = screen.getByLabelText(/Academic/i);
    const academicCheckbox = academicLabel.querySelector('input[type="checkbox"]') || academicLabel;
    fireEvent.click(academicCheckbox);

    // Submit the form
    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/scan/with-files',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnScanCreated).toHaveBeenCalledWith({ id: 1, title: 'Test Scan' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Server error' }),
      })
    );

    render(
      <CreateScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScanCreated={mockOnScanCreated}
      />
    );

    // Fill in title
    const titleInput = screen.getByPlaceholderText('e.g. Q4 Performance Reviews');
    fireEvent.change(titleInput, { target: { value: 'Test Scan' } });

    // Add a file
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', {
      value: 1024,
      writable: false,
    });

    const fileInput = document.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Submit the form
    const submitButton = screen.getByText('Start Scan');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockOnScanCreated).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
