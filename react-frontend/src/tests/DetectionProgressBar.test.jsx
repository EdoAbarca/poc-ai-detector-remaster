import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetectionProgressBar from '../components/DetectionProgressBar';

describe('DetectionProgressBar', () => {
  it('should render with detecting status', () => {
    render(
      <DetectionProgressBar
        currentDoc="test-document.pdf"
        progress={25}
        status="detecting"
        chunksProcessed={5}
        totalChunks={20}
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Detecting AI content...')).toBeInTheDocument();
    expect(screen.getByText('5/20 chunks')).toBeInTheDocument();
  });

  it('should render with aggregating status', () => {
    render(
      <DetectionProgressBar
        currentDoc="test-document.pdf"
        progress={95}
        status="aggregating"
        chunksProcessed={20}
        totalChunks={20}
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Aggregating results...')).toBeInTheDocument();
    expect(screen.getByText('20/20 chunks')).toBeInTheDocument();
  });

  it('should render with completed status', () => {
    render(
      <DetectionProgressBar
        currentDoc="test-document.pdf"
        progress={100}
        status="completed"
        chunksProcessed={20}
        totalChunks={20}
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Detection complete')).toBeInTheDocument();
  });

  it('should render with failed status', () => {
    render(
      <DetectionProgressBar
        currentDoc="test-document.pdf"
        progress={45}
        status="failed"
        message="Detection service unavailable"
      />
    );

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Detection service unavailable')).toBeInTheDocument();
  });

  it('should clamp progress to 0-100 range', () => {
    const { rerender } = render(
      <DetectionProgressBar
        currentDoc="test.pdf"
        progress={-10}
        status="detecting"
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(
      <DetectionProgressBar
        currentDoc="test.pdf"
        progress={150}
        status="detecting"
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display custom message when provided', () => {
    render(
      <DetectionProgressBar
        currentDoc="test.pdf"
        progress={30}
        status="detecting"
        message="Processing chunk 6 of 20..."
      />
    );

    expect(screen.getByText('Processing chunk 6 of 20...')).toBeInTheDocument();
  });

  it('should use default progress of 0 when not provided', () => {
    render(
      <DetectionProgressBar
        currentDoc="test.pdf"
        status="detecting"
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should use default status of detecting when not provided', () => {
    render(
      <DetectionProgressBar
        currentDoc="test.pdf"
        progress={50}
      />
    );

    expect(screen.getByText('Detecting AI content...')).toBeInTheDocument();
  });

  it('should render without chunks info when not provided', () => {
    render(
      <DetectionProgressBar
        currentDoc="test.pdf"
        progress={50}
        status="detecting"
      />
    );

    expect(screen.queryByText(/chunks/)).not.toBeInTheDocument();
  });

  it('should display Processing... when no currentDoc is provided', () => {
    render(
      <DetectionProgressBar
        progress={30}
        status="detecting"
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
