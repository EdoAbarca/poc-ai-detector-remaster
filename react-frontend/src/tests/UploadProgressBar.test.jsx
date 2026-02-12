import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UploadProgressBar from '../components/UploadProgressBar';

describe('UploadProgressBar', () => {
  it('should render with uploading status', () => {
    render(
      <UploadProgressBar
        fileName="test-document.pdf"
        progress={25}
        status="uploading"
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('should render with processing status', () => {
    render(
      <UploadProgressBar
        fileName="test-document.pdf"
        progress={50}
        status="processing"
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should render with completed status', () => {
    render(
      <UploadProgressBar
        fileName="test-document.pdf"
        progress={100}
        status="completed"
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Upload complete')).toBeInTheDocument();
  });

  it('should render with failed status', () => {
    render(
      <UploadProgressBar
        fileName="test-document.pdf"
        progress={45}
        status="failed"
        message="File processing failed"
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('File processing failed')).toBeInTheDocument();
  });

  it('should clamp progress to 0-100 range', () => {
    const { rerender } = render(
      <UploadProgressBar
        fileName="test.pdf"
        progress={-10}
        status="uploading"
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(
      <UploadProgressBar
        fileName="test.pdf"
        progress={150}
        status="uploading"
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display custom message when provided', () => {
    render(
      <UploadProgressBar
        fileName="test.pdf"
        progress={30}
        status="processing"
        message="Extracting text from PDF..."
      />
    );

    expect(screen.getByText('Extracting text from PDF...')).toBeInTheDocument();
  });

  it('should use default progress of 0 when not provided', () => {
    render(
      <UploadProgressBar
        fileName="test.pdf"
        status="uploading"
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should use default status of uploading when not provided', () => {
    render(
      <UploadProgressBar
        fileName="test.pdf"
        progress={50}
      />
    );

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    const { container } = render(
      <UploadProgressBar
        fileName="test.pdf"
        progress={75}
        status="uploading"
      />
    );

    const progressBar = container.querySelector('[style*="width: 75%"]');
    expect(progressBar).toBeInTheDocument();
  });
});
