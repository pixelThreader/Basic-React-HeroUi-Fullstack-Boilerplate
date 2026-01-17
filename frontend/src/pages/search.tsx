import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    Card, CardBody, Divider, Chip,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Spinner
} from "@heroui/react";
import { apiService, SearchResults } from "@/services/api";
import DefaultLayout from "@/layouts/default";
import { EyeIcon, SearchIcon } from "@/components/icons";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";
    const tableFilter = searchParams.get("table");

    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await apiService.search(query);

            // Apply filters if any
            if (tableFilter && data.relevantData) {
                data.relevantData = data.relevantData.filter((item: any) => item.tableName === tableFilter);
            }

            setResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderTopMatches = () => {
        if (!results?.topMatches || results.topMatches.length === 0) return null;

        return (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold px-1">Top Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.topMatches.map((match: any) => (
                        <Card key={match.id} as={Link} to={match.type === 'table' ? `/tables/${match.name}` : `/tables/${match.tableName}`} isPressable className="bg-primary-50 border-none shadow-sm">
                            <CardBody className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <Chip size="sm" color="primary" variant="flat">{match.type.toUpperCase()}</Chip>
                                    <EyeIcon className="text-primary-400" />
                                </div>
                                <p className="text-lg font-bold">{match.name || match.tableName}</p>
                                {match.type === 'data' && (
                                    <p className="text-sm text-default-500 line-clamp-2">
                                        {Object.entries(match.raw).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </p>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </div>
                <Divider className="my-4" />
            </div>
        );
    };

    const renderTables = () => {
        if (!results?.tables || results.tables.length === 0) return null;

        return (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-xl font-bold px-1">Tables</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {results.tables.map((table: any) => (
                        <Card key={table.id} as={Link} to={`/tables/${table.name}`} isPressable className="hover:bg-default-100 transition-colors border-none shadow-sm">
                            <CardBody className="flex flex-row items-center justify-between px-4 py-3">
                                <span className="font-semibold">{table.name}</span>
                                <EyeIcon className="text-default-400 w-4 h-4" />
                            </CardBody>
                        </Card>
                    ))}
                </div>
                <Divider className="my-4" />
            </div>
        );
    };

    const renderRelevantData = () => {
        if (!results?.relevantData || results.relevantData.length === 0) return null;

        return (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h2 className="text-xl font-bold px-1">Relevant Data</h2>
                <Card className="border-none shadow-sm">
                    <Table aria-label="Search results table" removeWrapper>
                        <TableHeader>
                            <TableColumn>TABLE</TableColumn>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>CONTENT</TableColumn>
                            <TableColumn align="center">ACTION</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {results.relevantData.map((data: any) => (
                                <TableRow key={data.id}>
                                    <TableCell><Chip size="sm" variant="flat">{data.tableName}</Chip></TableCell>
                                    <TableCell>{data.dataId}</TableCell>
                                    <TableCell>
                                        <div className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap text-sm text-default-600">
                                            {Object.entries(data.raw).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            as={Link}
                                            to={`/tables/${data.tableName}`}
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                        >
                                            <EyeIcon className="text-default-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        );
    };

    return (
        <DefaultLayout>
            <section className="flex flex-col gap-8 py-8 md:py-10 max-w-6xl mx-auto px-4 w-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <SearchIcon className="text-primary" />
                        Search Results
                    </h1>
                    <p className="text-default-500">
                        Showing results for <span className="text-foreground font-semibold">"{query}"</span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner label="Searching..." size="lg" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {results && Object.keys(results).length > 0 ? (
                            <>
                                {renderTopMatches()}
                                {renderTables()}
                                {renderRelevantData()}
                            </>
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <SearchIcon size={64} className="text-default-200" />
                                <p className="text-xl text-default-400 font-medium">No results found for your query.</p>
                                <Button as={Link} to="/" color="primary" variant="flat">GO BACK HOME</Button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </DefaultLayout>
    );
}
