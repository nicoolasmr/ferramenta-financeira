export default function ApiReferencePage() {
    return (
        <div>
            <h1>API Reference</h1>
            <p className="lead">Especificação completa dos endpoints REST do RevenueOS.</p>

            <h2>Autenticação</h2>
            <p>
                A API do RevenueOS usa autenticação baseada em <strong>Bearer Token</strong>.
                Passe sua chave de API no header <code>Authorization</code> de todas as requisições.
            </p>

            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>Authorization: Bearer sk_live_51Mz...</code>
            </pre>

            <hr className="my-8" />

            <h2>Base URL</h2>
            <p>Todas as URLs da API são relativas a:</p>
            <pre className="bg-slate-100 text-slate-800 p-3 rounded border font-mono text-sm">
                https://api.revenueos.com/v1
            </pre>

            <hr className="my-8" />

            <h2>Códigos de Erro</h2>
            <p>RevenueOS usa códigos HTTP convencionais para indicar sucesso ou falha.</p>

            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-3">Código</th>
                        <th className="p-3">Descrição</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    <tr>
                        <td className="p-3 font-mono text-emerald-600 font-bold">200 OK</td>
                        <td className="p-3">Tudo funcionou como esperado.</td>
                    </tr>
                    <tr>
                        <td className="p-3 font-mono text-amber-600 font-bold">400 Bad Request</td>
                        <td className="p-3">Faltam parâmetros obrigatórios ou formato inválido.</td>
                    </tr>
                    <tr>
                        <td className="p-3 font-mono text-amber-600 font-bold">401 Unauthorized</td>
                        <td className="p-3">Chave de API inválida ou ausente.</td>
                    </tr>
                    <tr>
                        <td className="p-3 font-mono text-amber-600 font-bold">402 Payment Required</td>
                        <td className="p-3">O cartão foi recusado ou saldo insuficiente.</td>
                    </tr>
                    <tr>
                        <td className="p-3 font-mono text-red-600 font-bold">500 Server Error</td>
                        <td className="p-3">Erro do nosso lado. (Isso é raro, prometemos).</td>
                    </tr>
                </tbody>
            </table>

            <hr className="my-8" />

            <h2>Endpoints Principais</h2>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs uppercase">GET</span>
                    <code className="text-base">/customers</code>
                </div>
                <p className="text-sm text-slate-600 mb-4">Lista todos os clientes com paginação.</p>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-xs uppercase">POST</span>
                    <code className="text-base">/invoices</code>
                </div>
                <p className="text-sm text-slate-600 mb-4">Cria uma nova fatura (cobrança avulsa).</p>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded text-xs uppercase">POST</span>
                    <code className="text-base">/subscriptions</code>
                </div>
                <p className="text-sm text-slate-600 mb-4">Inicia uma assinatura recorrente baseada em um Plano (Price ID).</p>
            </div>
        </div>
    );
}
