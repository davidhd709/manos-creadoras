import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('should render default title and message', () => {
    render(<MemoryRouter><ErrorState /></MemoryRouter>);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar la información')).toBeInTheDocument();
  });

  it('should render custom title and message', () => {
    render(<MemoryRouter><ErrorState title="Error custom" message="Mensaje custom" /></MemoryRouter>);
    expect(screen.getByText('Error custom')).toBeInTheDocument();
    expect(screen.getByText('Mensaje custom')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<MemoryRouter><ErrorState onRetry={onRetry} /></MemoryRouter>);

    const btn = screen.getByText('Intentar de nuevo');
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should render back link when backTo is provided', () => {
    render(<MemoryRouter><ErrorState backTo="/" backLabel="Ir al inicio" /></MemoryRouter>);
    expect(screen.getByText('Ir al inicio')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<MemoryRouter><ErrorState /></MemoryRouter>);
    expect(screen.queryByText('Intentar de nuevo')).not.toBeInTheDocument();
  });
});
