export const metadata = {
    title: "Política de Cookies | RevenueOS",
    description: "Como usamos cookies e tecnologias similares."
};

export default function CookiesPolicy() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <div className="bg-slate-50 border-b border-slate-200 py-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
                    <p className="text-slate-500 text-lg">Última atualização: 21 de Fevereiro de 2026</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-slate prose-lg">
                <h2>O que são Cookies?</h2>
                <p>
                    Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site.
                    Eles são amplamente utilizados para fazer os sites funcionarem ou funcionarem de maneira mais eficiente.
                </p>

                <h2>Como usamos Cookies</h2>
                <p>Utilizamos cookies para:</p>
                <ul>
                    <li>**Essenciais**: Necessários para autenticação e segurança (Sessão, CSRF).</li>
                    <li>**Analíticos**: Para entender como você usa o site e melhorar a experiência (ex: PostHog, Google Analytics).</li>
                    <li>**Funcionais**: Para lembrar suas preferências (ex: idioma, tema).</li>
                </ul>

                <h2>Gerenciamento</h2>
                <p>
                    Você pode controlar e/ou excluir cookies conforme desejar. Consulte a seção de ajuda do seu navegador para detalhes.
                    Note que desativar cookies essenciais pode impedir o login na plataforma.
                </p>
            </div>
        </div>
    );
}
