import type { Category, Product } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Alfaiataria",
    slug: "alfaiataria",
    description: "Cortes precisos em linho puro, crepe e lã fria.",
    image:
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    id: "cat-2",
    name: "Vestidos",
    slug: "vestidos",
    description: "Fluidez minimalista para o dia e a noite.",
    image:
      "https://images.unsplash.com/photo-1785354745571-2b7df3fdfe50?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    id: "cat-3",
    name: "Tricot & Malhas",
    slug: "tricot-malhas",
    description: "Fios macios de algodão pima e modal brasileiro.",
    image:
      "https://images.unsplash.com/photo-1626854586365-94312f94c8e5?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    id: "cat-4",
    name: "Acessórios",
    slug: "acessorios",
    description: "Couro legítimo e acabamentos esculturais.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "blazer-oversized-linho-puro",
    name: "Blazer Oversized Linho Puro",
    shortDescription:
      "Modelagem ampla contemporânea com forro de viscose acetinada e ombreiras suaves.",
    description:
      "Confeccionado em 100% linho europeu beneficiado no Brasil, o Blazer Oversized Aura traz corte arquitetônico com lapela clássica, bolsos embutidos e fechamento por botão único de chifre natural. Ideal para composições do escritório ao jantar.",
    price: 549.9,
    compareAtPrice: 689.9,
    images: [
      "https://images.unsplash.com/photo-1747817230321-4ad317ac0809?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1747815065172-a3234582223e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1747817330506-ef32218717cd?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-1",
    categorySlug: "alfaiataria",
    categoryName: "Alfaiataria",
    tags: ["linho", "alfaiataria", "destaque"],
    featured: true,
    isNew: true,
    stock: 22,
    specifications: {
      Composição: "100% Linho • Forro 100% Viscose",
      Origem: "Produzido em São Paulo, Brasil",
      Modelagem: "Oversized Estruturada",
      Cuidados: "Lavagem a seco ou à mão em água fria",
    },
    variants: [
      {
        id: "v-1-areia-pp",
        sku: "AUR-BLZ-ARE-PP",
        attributes: { Cor: "Areia", Tamanho: "PP" },
        stock: 4,
      },
      {
        id: "v-1-areia-p",
        sku: "AUR-BLZ-ARE-P",
        attributes: { Cor: "Areia", Tamanho: "P" },
        stock: 7,
      },
      {
        id: "v-1-areia-m",
        sku: "AUR-BLZ-ARE-M",
        attributes: { Cor: "Areia", Tamanho: "M" },
        stock: 3,
      },
      {
        id: "v-1-areia-g",
        sku: "AUR-BLZ-ARE-G",
        attributes: { Cor: "Areia", Tamanho: "G" },
        stock: 0,
      },
      {
        id: "v-1-preto-p",
        sku: "AUR-BLZ-PRT-P",
        attributes: { Cor: "Preto", Tamanho: "P" },
        stock: 5,
      },
      {
        id: "v-1-preto-m",
        sku: "AUR-BLZ-PRT-M",
        attributes: { Cor: "Preto", Tamanho: "M" },
        stock: 3,
      },
      {
        id: "v-1-preto-g",
        sku: "AUR-BLZ-PRT-G",
        attributes: { Cor: "Preto", Tamanho: "G" },
        stock: 2,
        priceOverride: 569.9,
      },
    ],
  },
  {
    id: "prod-2",
    slug: "vestido-midi-cetim-assimetrico",
    name: "Vestido Midi Cetim Assimétrico",
    shortDescription:
      "Corte enviesado que acompanha os movimentos com brilho acetinado discreto.",
    description:
      "Desenvolvido em cetim de seda mista com corte no viés, o Vestido Midi Assimétrico possui alças reguláveis e decote fluido nas costas. Uma peça versátil para eventos diurnos com sandálias rasteiras ou noturnos com salto minimalista.",
    price: 429.9,
    compareAtPrice: 499.9,
    images: [
      "https://images.unsplash.com/photo-1750064161409-5cc34e5f7367?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1785354745594-c205b95004e2?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-2",
    categorySlug: "vestidos",
    categoryName: "Vestidos",
    tags: ["vestido", "festa", "cetim"],
    featured: true,
    isNew: true,
    stock: 16,
    specifications: {
      Composição: "70% Viscose, 30% Seda",
      Origem: "Produzido no Brasil",
      Modelagem: "Evasê no Viés",
      Cuidados: "Passar a vapor pelo avesso",
    },
    variants: [
      {
        id: "v-2-off-p",
        sku: "AUR-VST-OFF-P",
        attributes: { Cor: "Off-White", Tamanho: "P" },
        stock: 5,
      },
      {
        id: "v-2-off-m",
        sku: "AUR-VST-OFF-M",
        attributes: { Cor: "Off-White", Tamanho: "M" },
        stock: 4,
      },
      {
        id: "v-2-off-g",
        sku: "AUR-VST-OFF-G",
        attributes: { Cor: "Off-White", Tamanho: "G" },
        stock: 2,
      },
      {
        id: "v-2-terra-p",
        sku: "AUR-VST-TER-P",
        attributes: { Cor: "Terracota", Tamanho: "P" },
        stock: 3,
      },
      {
        id: "v-2-terra-m",
        sku: "AUR-VST-TER-M",
        attributes: { Cor: "Terracota", Tamanho: "M" },
        stock: 0,
      },
      {
        id: "v-2-terra-g",
        sku: "AUR-VST-TER-G",
        attributes: { Cor: "Terracota", Tamanho: "G" },
        stock: 2,
      },
    ],
  },
  {
    id: "prod-3",
    slug: "calca-pantalona-alfaiataria-crepe",
    name: "Calça Pantalona Alfaiataria Crepe",
    shortDescription:
      "Cintura alta com pregas frontais duplas e caimento alongado.",
    description:
      "Nossa pantalona ícone em crepe encorpado que não amassa com facilidade. Conta com cós anatômico, bolsos faca laterais e barra larga para ajuste personalizado.",
    price: 369.9,
    images: [
      "https://images.unsplash.com/photo-1767631338127-8cd80ee2f9df?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1773859095499-ce1b6d3be9f3?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-1",
    categorySlug: "alfaiataria",
    categoryName: "Alfaiataria",
    tags: ["calça", "pantalona", "crepe"],
    featured: true,
    stock: 25,
    specifications: {
      Composição: "96% Poliéster Reciclado, 4% Elastano",
      Origem: "Produzido em Minas Gerais, Brasil",
      Modelagem: "Pantalona Cintura Alta",
      Cuidados: "Lavagem delicada na máquina",
    },
    variants: [
      {
        id: "v-3-preto-pp",
        sku: "AUR-CLC-PRT-PP",
        attributes: { Cor: "Preto", Tamanho: "PP" },
        stock: 4,
      },
      {
        id: "v-3-preto-p",
        sku: "AUR-CLC-PRT-P",
        attributes: { Cor: "Preto", Tamanho: "P" },
        stock: 6,
      },
      {
        id: "v-3-preto-m",
        sku: "AUR-CLC-PRT-M",
        attributes: { Cor: "Preto", Tamanho: "M" },
        stock: 8,
      },
      {
        id: "v-3-preto-g",
        sku: "AUR-CLC-PRT-G",
        attributes: { Cor: "Preto", Tamanho: "G" },
        stock: 3,
      },
      {
        id: "v-3-areia-p",
        sku: "AUR-CLC-ARE-P",
        attributes: { Cor: "Areia", Tamanho: "P" },
        stock: 2,
      },
      {
        id: "v-3-areia-m",
        sku: "AUR-CLC-ARE-M",
        attributes: { Cor: "Areia", Tamanho: "M" },
        stock: 2,
      },
    ],
  },
  {
    id: "prod-4",
    slug: "tricot-canelado-gola-alta",
    name: "Tricot Canelado Gola Alta",
    shortDescription:
      "Fio modal de toque sedoso com trama canelada vertical que valoriza a silhueta.",
    description:
      "Tricot de espessura média perfeito para meia-estação e sobreposições de inverno. A mistura de modal e algodão garante respirabilidade e zero pinicamento.",
    price: 259.9,
    compareAtPrice: 319.9,
    images: [
      "https://images.unsplash.com/photo-1628050112226-7f143208f9d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1780764206626-3b0acdf4a85e?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-3",
    categorySlug: "tricot-malhas",
    categoryName: "Tricot & Malhas",
    tags: ["tricot", "inverno", "essencial"],
    featured: true,
    stock: 30,
    specifications: {
      Composição: "60% Modal, 40% Algodão Pima",
      Origem: "Produzido na Serra Gaúcha, Brasil",
      Modelagem: "Ajustada Confortável",
      Cuidados: "Secar na horizontal à sombra",
    },
    variants: [
      {
        id: "v-4-off-p",
        sku: "AUR-TRC-OFF-P",
        attributes: { Cor: "Off-White", Tamanho: "P" },
        stock: 8,
      },
      {
        id: "v-4-off-m",
        sku: "AUR-TRC-OFF-M",
        attributes: { Cor: "Off-White", Tamanho: "M" },
        stock: 9,
      },
      {
        id: "v-4-oliva-p",
        sku: "AUR-TRC-OLV-P",
        attributes: { Cor: "Oliva", Tamanho: "P" },
        stock: 6,
      },
      {
        id: "v-4-oliva-m",
        sku: "AUR-TRC-OLV-M",
        attributes: { Cor: "Oliva", Tamanho: "M" },
        stock: 4,
      },
      {
        id: "v-4-oliva-g",
        sku: "AUR-TRC-OLV-G",
        attributes: { Cor: "Oliva", Tamanho: "G" },
        stock: 3,
      },
    ],
  },
  {
    id: "prod-5",
    slug: "bolsa-tiracolo-couro-minimal",
    name: "Bolsa Tiracolo Couro Minimal",
    shortDescription:
      "Couro bovino legítimo de grão macio com ferragens em banho ouro fosco.",
    description:
      "Design arquitetônico sem excessos. Possui alça ajustável com fivela oculta, fechamento magnético interno e bolso dedicado para celular e cartões.",
    price: 489.9,
    images: [
      "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1774702535771-eec0c74d6cb9?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-4",
    categorySlug: "acessorios",
    categoryName: "Acessórios",
    tags: ["bolsa", "couro", "acessorio"],
    featured: true,
    isNew: true,
    stock: 9,
    specifications: {
      Material: "100% Couro Bovino Legítimo",
      Dimensões: "24cm (L) × 16cm (A) × 7cm (P)",
      Forro: "Sarja de Algodão Cru",
      Origem: "Feito à mão no Brasil",
    },
    // Sem variants para validar o suporte opcional da matriz de SKU (${productId}:default)
  },
  {
    id: "prod-6",
    slug: "camisa-algodao-egipcio-botoes",
    name: "Camisa Algodão Egípcio Botões",
    shortDescription:
      "Trama tricoline de alta densidade com punhos alongados e botões em madrepérola.",
    description:
      "Um clássico elevado pela matéria-prima nobre. A Camisa Aura tem caimento levemente solto, pala traseira com prega sutil e acabamento francês nas costuras internas.",
    price: 319.9,
    compareAtPrice: 379.9,
    images: [
      "https://images.unsplash.com/photo-1776633734832-ca4ad72e203a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1612485842581-0dce50d5268f?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-1",
    categorySlug: "alfaiataria",
    categoryName: "Alfaiataria",
    tags: ["camisa", "tricoline", "trabalho"],
    featured: true,
    stock: 18,
    specifications: {
      Composição: "100% Algodão Egípcio Fio 80",
      Botões: "Madrepérola Natural",
      Modelagem: "Reta Relaxada",
      Origem: "Produzido em Santa Catarina, Brasil",
    },
    variants: [
      {
        id: "v-6-off-pp",
        sku: "AUR-CMS-OFF-PP",
        attributes: { Cor: "Off-White", Tamanho: "PP" },
        stock: 4,
      },
      {
        id: "v-6-off-p",
        sku: "AUR-CMS-OFF-P",
        attributes: { Cor: "Off-White", Tamanho: "P" },
        stock: 6,
      },
      {
        id: "v-6-off-m",
        sku: "AUR-CMS-OFF-M",
        attributes: { Cor: "Off-White", Tamanho: "M" },
        stock: 5,
      },
      {
        id: "v-6-off-g",
        sku: "AUR-CMS-OFF-G",
        attributes: { Cor: "Off-White", Tamanho: "G" },
        stock: 3,
      },
    ],
  },
  {
    id: "prod-7",
    slug: "cardigan-tricot-trama-larga",
    name: "Cardigan Tricot Trama Larga",
    shortDescription:
      "Textura artesanal em ponto pérola com bolsos chapados e mangas bufantes sutis.",
    description:
      "Peça-chave para dias amenos, o Cardigan Trama Larga combina o conforto de uma malha artesanal com o visual polido da marca Aura.",
    price: 349.9,
    images: [
      "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1588271968087-4c51abe05afc?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-3",
    categorySlug: "tricot-malhas",
    categoryName: "Tricot & Malhas",
    tags: ["cardigan", "tricot", "sobreposição"],
    featured: false,
    isNew: true,
    stock: 14,
    specifications: {
      Composição: "75% Algodão, 25% Poliamida",
      Origem: "Produzido em Minas Gerais, Brasil",
      Modelagem: "Solta / Cropped Alongado",
    },
    variants: [
      {
        id: "v-7-areia-p",
        sku: "AUR-CRD-ARE-P",
        attributes: { Cor: "Areia", Tamanho: "P" },
        stock: 5,
      },
      {
        id: "v-7-areia-m",
        sku: "AUR-CRD-ARE-M",
        attributes: { Cor: "Areia", Tamanho: "M" },
        stock: 5,
      },
      {
        id: "v-7-terra-m",
        sku: "AUR-CRD-TER-M",
        attributes: { Cor: "Terracota", Tamanho: "M" },
        stock: 4,
      },
    ],
  },
  {
    id: "prod-8",
    slug: "cinto-couro-fivela-escultural",
    name: "Cinto Couro Fivela Escultural",
    shortDescription:
      "Couro liso italiano com fivela orgânica em metal banhado.",
    description:
      "Acessório essencial para marcar a cintura em blazers, vestidos ou calças de alfaiataria. Possui 7 furos de ajuste e acabamento chanfrado nas bordas.",
    price: 189.9,
    compareAtPrice: 229.9,
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549654929-e63d34779e41?auto=format&fit=crop&w=900&q=80",
    ],
    categoryId: "cat-4",
    categorySlug: "acessorios",
    categoryName: "Acessórios",
    tags: ["cinto", "couro"],
    featured: false,
    stock: 20,
    specifications: {
      Material: "100% Couro Legítimo",
      Largura: "3,0 cm",
      Ferragem: "Zamac com banho níquel escovado",
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.featured);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCat = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  );
  const others = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug
  );
  return [...sameCat, ...others].slice(0, limit);
}
