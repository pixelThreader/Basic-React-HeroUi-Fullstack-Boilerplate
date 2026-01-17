import { useEffect, useState } from "react";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Breadcrumbs, BreadcrumbItem, Tooltip, Checkbox,
    DatePicker, Switch, Chip
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { ConfirmModal } from "@/components/confirm-modal";
import { apiService, TableInfo } from "@/services/api";
import { useParams, Link } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import { PlusIcon, TrashIcon, EditIcon, SearchIcon } from "@/components/icons";

export default function TableDataPage() {
    const { tableName } = useParams<{ tableName: string }>();
    const [data, setData] = useState<any[]>([]);
    const [schema, setSchema] = useState<TableInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onOpenChange: onDeleteOpenChange
    } = useDisclosure();
    const {
        isOpen: isSettingsOpen,
        onOpen: onSettingsOpen,
        onOpenChange: onSettingsOpenChange
    } = useDisclosure();

    const [recordToDelete, setRecordToDelete] = useState<any>(null);
    const [editingId, setEditingId] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [settingsColumns, setSettingsColumns] = useState<TableInfo[]>([]);

    useEffect(() => {
        if (tableName) {
            fetchSchema();
            fetchData();
        }
    }, [tableName]);

    const fetchSchema = async () => {
        try {
            if (!tableName) return;
            const info = await apiService.getTableSchema(tableName);
            setSchema(info);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            if (!tableName) return;
            const result = await apiService.getTableData(tableName);
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({});
        onOpen();
    };

    const handleOpenEdit = (record: any) => {
        setEditingId(record.id);
        setFormData(record);
        onOpen();
    };

    const handleOpenSettings = () => {
        setSettingsColumns([...schema]);
        onSettingsOpen();
    };

    const handleSettingsToggle = (colName: string, isSearchable: boolean) => {
        setSettingsColumns(prev => prev.map(c =>
            c.name === colName ? { ...c, isSearchable } : c
        ));
    };

    const handleSaveSettings = async (onClose: () => void) => {
        if (!tableName) return;
        try {
            await apiService.updateSearchMeta(tableName, settingsColumns.map(c => ({
                column_name: c.name,
                is_searchable: c.isSearchable
            })));
            fetchSchema();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (colName: string, value: any) => {
        setFormData({ ...formData, [colName]: value });
    };

    const renderField = (col: TableInfo) => {
        if (col.name === 'id' && !editingId) return null;

        if (col.type === 'DATE') {
            const value = formData[col.name];
            let calendarDate = undefined;
            if (value) {
                try {
                    calendarDate = parseDate(value.split('T')[0]);
                } catch (e) {
                    console.error("Invalid date:", value);
                }
            }
            return (
                <DatePicker
                    key={col.name}
                    label={col.name}
                    value={calendarDate}
                    onChange={(date) => handleInputChange(col.name, date?.toString())}
                    isDisabled={col.name === 'id'}
                />
            );
        }

        if (col.type === 'BOOLEAN') {
            return (
                <div key={col.name} className="flex items-center justify-between p-2 border border-default-200 rounded-lg">
                    <span className="text-sm font-medium text-default-600">{col.name}</span>
                    <Switch
                        isSelected={!!formData[col.name]}
                        onValueChange={(v) => handleInputChange(col.name, v ? 1 : 0)}
                    />
                </div>
            );
        }

        return (
            <Input
                key={col.name}
                label={col.name}
                type={col.type === 'INTEGER' || col.type === 'REAL' ? 'number' : 'text'}
                placeholder={`Enter ${col.name}`}
                value={formData[col.name]?.toString() || ""}
                onValueChange={(v) => handleInputChange(col.name, v)}
                disabled={col.name === 'id'}
            />
        );
    };

    const handleSubmit = async (onClose: () => void) => {
        if (!tableName) return;
        try {
            if (editingId) {
                await apiService.updateData(tableName, editingId, formData);
            } else {
                await apiService.createData(tableName, formData);
            }
            fetchData();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRequest = (id: any) => {
        setRecordToDelete(id);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        if (!tableName || !recordToDelete) return;
        try {
            await apiService.deleteData(tableName, recordToDelete);
            fetchData();
            setRecordToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                    <Breadcrumbs>
                        <BreadcrumbItem>
                            <Link to="/tables">Tables</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{tableName}</BreadcrumbItem>
                    </Breadcrumbs>

                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold">{tableName} Data</h1>
                            <Tooltip content="Search Settings">
                                <Button isIconOnly variant="flat" size="sm" onPress={handleOpenSettings}>
                                    <SearchIcon size={18} />
                                </Button>
                            </Tooltip>
                        </div>
                        <Button color="primary" onPress={handleOpenCreate} startContent={<PlusIcon />}>
                            Add Record
                        </Button>
                    </div>

                    <div className="mt-4">
                        <Table aria-label={`${tableName} Data`}>
                            <TableHeader>
                                {[
                                    ...schema.map((col) => (
                                        <TableColumn key={col.name}>{col.name.toUpperCase()}</TableColumn>
                                    )),
                                    <TableColumn key="actions" align="center">ACTIONS</TableColumn>
                                ]}
                            </TableHeader>
                            <TableBody loadingContent={"Loading..."} isLoading={loading}>
                                {data.map((row, rowIndex) => (
                                    <TableRow key={row.id || rowIndex}>
                                        {[
                                            ...schema.map((col) => (
                                                <TableCell key={col.name}>
                                                    {col.type === 'BOOLEAN'
                                                        ? (row[col.name] ? <Chip size="sm" color="success" variant="flat">Yes</Chip> : <Chip size="sm" color="default" variant="flat">No</Chip>)
                                                        : row[col.name]?.toString()
                                                    }
                                                </TableCell>
                                            )),
                                            <TableCell key="actions">
                                                <div className="relative flex items-center justify-center gap-2">
                                                    <Tooltip content="Edit">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleOpenEdit(row)}
                                                        >
                                                            <EditIcon className="text-default-400" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip color="danger" content="Delete">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleDeleteRequest(row.id)}
                                                        >
                                                            <TrashIcon className="text-danger" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        ]}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>{editingId ? "Edit Record" : "Add Record"}</ModalHeader>
                                <ModalBody>
                                    <div className="flex flex-col gap-4">
                                        {schema.map((col) => renderField(col))}
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={() => handleSubmit(onClose)}>
                                        {editingId ? "Update" : "Create"}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                <ConfirmModal
                    isOpen={isDeleteOpen}
                    onOpenChange={onDeleteOpenChange}
                    onConfirm={confirmDelete}
                    title="Delete Record"
                    message="Are you sure you want to delete this record? This action cannot be undone."
                    confirmLabel="Delete"
                />

                <Modal isOpen={isSettingsOpen} onOpenChange={onSettingsOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Search Settings for {tableName}</ModalHeader>
                                <ModalBody>
                                    <p className="text-sm text-default-500 mb-4">
                                        Choose which columns should be indexed for the global search.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {settingsColumns.map((col) => (
                                            <div key={col.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-default-50">
                                                <span className="font-medium">{col.name}</span>
                                                <Checkbox
                                                    isSelected={col.isSearchable}
                                                    onValueChange={(v) => handleSettingsToggle(col.name, v)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={() => handleSaveSettings(onClose)}>
                                        Save Settings
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </section>
        </DefaultLayout>
    );
}
