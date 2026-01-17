import { useEffect, useState } from "react";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Tooltip, Checkbox, Chip
} from "@heroui/react";
import { ConfirmModal } from "@/components/confirm-modal";
import { apiService, Column } from "@/services/api";
import { Link } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import { PlusIcon, TrashIcon, EyeIcon, EditIcon } from "@/components/icons";

interface EditableColumn extends Column {
    id: string;
    isOriginal?: boolean;
    originalName?: string;
}

const TYPE_OPTIONS = [
    { label: "Text", value: "TEXT" },
    { label: "Number", value: "INTEGER" },
    { label: "Date", value: "DATE" },
    { label: "Boolean", value: "BOOLEAN" },
];

export default function TablesPage() {
    const [tables, setTables] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onOpenChange: onDeleteOpenChange
    } = useDisclosure();

    const [tableToDelete, setTableToDelete] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTableName, setEditingTableName] = useState("");

    const [newTableName, setNewTableName] = useState("");
    const [columns, setColumns] = useState<EditableColumn[]>([
        { id: Math.random().toString(), name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT", isSearchable: true, isOriginal: true }
    ]);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const data = await apiService.getTables();
            setTables(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setEditingTableName("");
        setNewTableName("");
        setColumns([
            { id: Math.random().toString(), name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT", isSearchable: true, isOriginal: true }
        ]);
        onOpen();
    };

    const handleOpenEdit = async (tableName: string) => {
        try {
            setIsEditMode(true);
            setEditingTableName(tableName);
            setNewTableName(tableName);
            const schema = await apiService.getTableSchema(tableName);

            setColumns(schema.map(col => ({
                id: Math.random().toString(),
                name: col.name,
                type: col.type,
                isSearchable: col.isSearchable,
                isOriginal: true,
                originalName: col.name
            })));

            onOpen();
        } catch (error) {
            console.error(error);
        }
    };

    const addColumn = () => {
        setColumns([...columns, { id: Math.random().toString(), name: "", type: "TEXT", isSearchable: true }]);
    };

    const removeColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const handleColumnChange = (index: number, field: keyof EditableColumn, value: any) => {
        const updated = [...columns];
        (updated[index] as any)[field] = value;
        setColumns(updated);
    };

    const handleSaveTable = async (onClose: () => void) => {
        if (!newTableName) return;
        try {
            if (isEditMode) {
                const originalSchema = await apiService.getTableSchema(editingTableName);
                const originalNames = originalSchema.map(s => s.name);
                const dropped = originalNames.filter(n => !columns.find(c => c.isOriginal && c.originalName === n));
                const added = columns.filter(c => !c.isOriginal);
                const renamed = columns
                    .filter(c => c.isOriginal && c.name !== c.originalName)
                    .map(c => ({ oldName: c.originalName!, newName: c.name }));

                await apiService.updateTable(editingTableName, {
                    newName: newTableName === editingTableName ? undefined : newTableName,
                    addColumns: added.length > 0 ? added : undefined,
                    dropColumns: dropped.length > 0 ? dropped : undefined,
                    renameColumns: renamed.length > 0 ? renamed : undefined
                });
            } else {
                await apiService.createTable(newTableName, columns);
            }
            fetchTables();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTableRequest = (name: string) => {
        setTableToDelete(name);
        onDeleteOpen();
    };

    const confirmDeleteTable = async () => {
        if (!tableToDelete) return;
        try {
            await apiService.deleteTable(tableToDelete);
            fetchTables();
            setTableToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="flex justify-between items-center w-full max-w-4xl px-4">
                    <h1 className="text-3xl font-bold">Database Tables</h1>
                    <Button color="primary" onPress={handleOpenCreate} startContent={<PlusIcon />}>
                        Create Table
                    </Button>
                </div>

                <div className="w-full max-w-4xl px-4 mt-6">
                    <Table aria-label="Database Tables">
                        <TableHeader>
                            <TableColumn>TABLE NAME</TableColumn>
                            <TableColumn align="center">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody loadingContent={"Loading..."} isLoading={loading}>
                            {tables.map((table) => (
                                <TableRow key={table}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{table}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center justify-center gap-2">
                                            <Tooltip content="View Data">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    as={Link}
                                                    to={`/tables/${table}`}
                                                >
                                                    <EyeIcon className="text-default-400" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Edit Table">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleOpenEdit(table)}
                                                >
                                                    <EditIcon className="text-default-400" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip color="danger" content="Delete Table">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleDeleteTableRequest(table)}
                                                >
                                                    <TrashIcon className="text-danger" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>{isEditMode ? `Edit Table: ${editingTableName}` : "Create New Table"}</ModalHeader>
                                <ModalBody>
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            label="Table Name"
                                            placeholder="Enter table name"
                                            value={newTableName}
                                            onValueChange={setNewTableName}
                                        />

                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-sm font-semibold">Columns</h3>
                                                <Button size="sm" variant="flat" onPress={addColumn}>
                                                    Add Column
                                                </Button>
                                            </div>

                                            {columns.map((col, index) => (
                                                <div key={col.id} className="flex gap-2 items-center">
                                                    <Input
                                                        size="sm"
                                                        label="Name"
                                                        value={col.name}
                                                        onValueChange={(v) => handleColumnChange(index, "name", v)}
                                                        disabled={col.name === 'id'}
                                                    />
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <span className="text-xs text-default-500">Type</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {TYPE_OPTIONS.map((opt) => (
                                                                <Chip
                                                                    key={opt.value}
                                                                    variant={col.type === opt.value ? "solid" : "flat"}
                                                                    color={col.type === opt.value ? "primary" : "default"}
                                                                    className="cursor-pointer"
                                                                    onClick={() => !col.isOriginal && handleColumnChange(index, "type", opt.value)}
                                                                >
                                                                    {opt.label}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Checkbox
                                                        isSelected={col.isSearchable}
                                                        onValueChange={(v) => handleColumnChange(index, "isSearchable", v)}
                                                        size="sm"
                                                    >
                                                        Search
                                                    </Checkbox>
                                                    {col.name !== 'id' && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            color="danger"
                                                            variant="light"
                                                            onPress={() => removeColumn(index)}
                                                        >
                                                            <TrashIcon />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={() => handleSaveTable(onClose)}>
                                        {isEditMode ? "Save Changes" : "Create"}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                <ConfirmModal
                    isOpen={isDeleteOpen}
                    onOpenChange={onDeleteOpenChange}
                    onConfirm={confirmDeleteTable}
                    title="Delete Table"
                    message={`Are you sure you want to delete the table "${tableToDelete}"? This action cannot be undone and all data will be lost.`}
                    confirmLabel="Delete Table"
                />
            </section>
        </DefaultLayout>
    );
}
