import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Home } from 'lucide-react';

describe('Card Components', () => {
  describe('Card', () => {
    it('debería renderizar correctamente', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('debería aplicar clases de padding correctamente', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('debería aplicar altura full cuando se especifica', () => {
      const { container } = render(<Card height="full">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('h-full');
    });
  });

  describe('CardHeader', () => {
    it('debería renderizar con título y descripción', () => {
      render(
        <CardHeader title="Test Title" description="Test Description" />
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('debería renderizar icono cuando se proporciona', () => {
      render(
        <CardHeader title="Test Title" icon={Home} />
      );
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('debería renderizar actions cuando se proporcionan', () => {
      render(
        <CardHeader 
          title="Test Title" 
          actions={<button>Action</button>} 
        />
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('debería renderizar texto correctamente', () => {
      render(<CardTitle>Test Title</CardTitle>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('debería tener las clases correctas', () => {
      const { container } = render(<CardTitle>Test</CardTitle>);
      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass('text-2xl', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('debería renderizar texto correctamente', () => {
      render(<CardDescription>Test Description</CardDescription>);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('debería tener las clases correctas', () => {
      const { container } = render(<CardDescription>Test</CardDescription>);
      const description = container.firstChild as HTMLElement;
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('debería renderizar contenido correctamente', () => {
      render(<CardContent>Content</CardContent>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('debería aplicar flex cuando se especifica', () => {
      const { container } = render(<CardContent flex>Content</CardContent>);
      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('flex-grow');
    });
  });

  describe('CardFooter', () => {
    it('debería renderizar contenido correctamente', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('debería aplicar justify-between cuando se especifica', () => {
      const { container } = render(<CardFooter justify="between">Content</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('justify-between');
    });
  });

  describe('Card completo', () => {
    it('debería renderizar card con todos los componentes', () => {
      render(
        <Card>
          <CardHeader title="Card Title" description="Card Description" />
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });
  });
});
