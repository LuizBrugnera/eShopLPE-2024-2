import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCategoriaPorCodigoDB, addCategoriaDB, updateCategoriaDB }
    from "@/componentes/bd/usecases/categoriaUseCases";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Suspense } from 'react';
import Loading from '@/componentes/comuns/Loading';

const FormularioPage = async ({ params }) => {
    let categoria = null;
    if (params.codigo == 0) {
        categoria = { codigo: 0, nome: "" }
    } else {
        try {
            categoria = await getCategoriaPorCodigoDB(params.codigo);
        } catch (err) {
            return notFound();
        }
    }

    const salvarCategoria = async (formData) => {
        'use server';

        const objeto = {
            codigo: formData.get('codigo'),
            nome: formData.get('nome')
        };

        // Validação simples no servidor
        if (objeto.nome.length < 3) {
            throw new Error("O nome deve ter pelo menos 3 caracteres.");
        }

        try {
            if (objeto.codigo == 0) {
                await addCategoriaDB(objeto);
            } else {
                await updateCategoriaDB(objeto);
            }
        } catch (err) {
            throw new Error('Erro: ' + err);
        }
        revalidatePath('/privado/categoria/');
        redirect('/privado/categoria');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        // Validação no lado do cliente
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const formData = new FormData(form);
            salvarCategoria(formData);
        }

        form.classList.add('was-validated');
    };

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Categoria</h2>
                </div>
                <Form noValidate onSubmit={handleSubmit}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-6">
                                <div>
                                    <FloatingLabel controlId="campoCodigo"
                                        label="Código" className="mb-3">
                                        <Form.Control type="number"
                                            defaultValue={categoria.codigo} readOnly
                                            name="codigo" />
                                    </FloatingLabel>
                                </div>
                                <div>
                                    <FloatingLabel controlId="campoNome"
                                        label="Nome" className="mb-3">
                                        <Form.Control type="text"
                                            defaultValue={categoria.nome}
                                            name="nome"
                                            required
                                            minLength="3"
                                            isInvalid={categoria.nome.length < 3}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            O nome deve ter pelo menos 3 caracteres.
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                </div>
                                <div className="form-group text-center mt-3">
                                    <button type="submit" className="btn btn-success">
                                        Salvar <i className="bi bi-save"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </Suspense>
        </>
    );
};

export default FormularioPage;
