export default function Page({ params }: { params: { id: string } }) {
    return <div>My Book: {params.id}</div>
}