export interface Location {
    id: string;
    name: string;
    country: string;
}

export const locations: Location[] = [
    // Brasil
    { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil' },
    { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil' },
    { id: 'belo-horizonte', name: 'Belo Horizonte', country: 'Brazil' },
    { id: 'brasilia', name: 'Brasília', country: 'Brazil' },
    { id: 'salvador', name: 'Salvador', country: 'Brazil' },
    { id: 'fortaleza', name: 'Fortaleza', country: 'Brazil' },
    { id: 'curitiba', name: 'Curitiba', country: 'Brazil' },
    { id: 'manaus', name: 'Manaus', country: 'Brazil' },
    { id: 'recife', name: 'Recife', country: 'Brazil' },
    { id: 'porto-alegre', name: 'Porto Alegre', country: 'Brazil' },
    // USA
    { id: 'new-york', name: 'New York', country: 'USA' },
    { id: 'los-angeles', name: 'Los Angeles', country: 'USA' },
    { id: 'chicago', name: 'Chicago', country: 'USA' },
    { id: 'miami', name: 'Miami', country: 'USA' },
    // Japão
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'kyoto', name: 'Kyoto', country: 'Japan' },
    { id: 'osaka', name: 'Osaka', country: 'Japan' },
    // Espanha
    { id: 'madrid', name: 'Madrid', country: 'Spain' },
    { id: 'barcelona', name: 'Barcelona', country: 'Spain' },
    // Outros
    { id: 'london', name: 'London', country: 'UK' },
    { id: 'paris', name: 'Paris', country: 'France' },
    { id: 'berlin', name: 'Berlin', country: 'Germany' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' },
    { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina' },
    { id: 'toronto', name: 'Toronto', country: 'Canada' },
];
