import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { intelligenceApi } from '../../utils/api';
import { ChevronLeft, Save, Plus, CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from 'date-fns';
import AddNewsItemsModal from '../../components/modals/AddNewsItemsModal';

// --- Enhanced Interfaces ---

interface AttributeEnum {
    id: number;
    value: string;
}

interface AttributeDefinition {
    id: number;
    name: string;
    type: string;
    attribute_enums: AttributeEnum[];
}

interface AttributeGroupItem {
    id: number;
    title: string;
    description: string;
    attribute?: AttributeDefinition; // Now includes type info
}

// --- Reusable Attribute Components ---

const RadioGroupComponent = ({ value, onChange, options }: { value: string, onChange: (value: string) => void, options: AttributeEnum[] }) => (
    <div className="flex items-center space-x-4 pt-2">
        {options.map(opt => (
            <label key={opt.id} className="flex items-center space-x-2">
                <input type="radio" name={opt.value} value={opt.value} checked={value === opt.value} onChange={(e) => onChange(e.target.value)} className="form-radio" />
                <span>{opt.value}</span>
            </label>
        ))}
    </div>
);

const ImpactComponent = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const impactOptions = [
        "Malicious code execution affecting overall confidentiality, integrity, and availability of the system",
        "Malicious code execution",
        "Denial of service",
        "Privilege escalation",
        "Information exposure",
        "Unauthorized access to the system",
        "Unauthorized change in system"
    ];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-dark-400 dark:border-dark-500"
        >
            <option value="">Select Impact</option>
            {impactOptions.map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

const TlpComponent = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const options = [
        { label: "TLP:CLEAR", value: "CLEAR" },
        { label: "TLP:GREEN", value: "GREEN" },
        { label: "TLP:AMBER", value: "AMBER" },
        { label: "TLP:AMBER+STRICT", value: "AMBER+STRICT" },
        { label: "TLP:RED", value: "RED" },
    ];
    return (
        <div className="flex items-center space-x-4">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center space-x-2">
                    <input type="radio" name="tlp" value={opt.value} checked={value === opt.value} onChange={(e) => onChange(e.target.value)} className="form-radio" />
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
    );
};

const ConfidentialityComponent = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const options = [
        "UNRESTRICTED",
        "CLASSIFIED",
        "CONFIDENTIAL",
        "SECRET",
        "TOP SECRET",
    ];
    return (
        <div className="flex items-center space-x-4">
            {options.map(opt => (
                <label key={opt} className="flex items-center space-x-2">
                    <input type="radio" name="confidentiality" value={opt} checked={value === opt} onChange={(e) => onChange(e.target.value)} className="form-radio" />
                    <span>{opt}</span>
                </label>
            ))}
        </div>
    );
};

const CvssScoreComponent = ({ title, score, severity, color }: { title: string, score: string, severity: string, color: string }) => (
    <div className={`${color} text-white p-2 text-center rounded flex-1`}>
        {title} {severity}<br /><span className="font-bold text-xl">{score}</span>
    </div>
);

const CvssComponent = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    return (
        <div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500"
                placeholder="CVSS Vector String"
            />
            <div className="flex gap-2 mt-2">
                <CvssScoreComponent title="Base Score" score="9.8" severity="CRITICAL" color="bg-red-600" />
                <CvssScoreComponent title="Temporal Score" score="9.8" severity="CRITICAL" color="bg-red-600" />
                <CvssScoreComponent title="Environmental Score" score="9.8" severity="CRITICAL" color="bg-red-600" />
            </div>
        </div>
    );
};

const DateComponent = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const dateFormatApi = "dd.MM.yyyy - HH:mm";
    const dateFormatInput = "dd.MM.yyyy - HH:mm";
    
    // Fix: Add proper validation for date parsing
    const parseDateSafely = (dateString: string): Date | null => {
        if (!dateString || dateString.trim() === '') {
            return null;
        }
        try {
            const parsedDate = parse(dateString, dateFormatApi, new Date());
            // Check if the parsed date is valid
            if (isNaN(parsedDate.getTime())) {
                return null;
            }
            return parsedDate;
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return null;
        }
    };
    
    const [startDate, setStartDate] = useState<Date | null>(parseDateSafely(value));
    
    // Update startDate when value prop changes
    useEffect(() => {
        setStartDate(parseDateSafely(value));
    }, [value]);
    
    const handleDateChange = (date: Date | null) => {
        setStartDate(date);
        onChange(date ? format(date, dateFormatApi) : '');
    };

    const CustomInput = React.forwardRef<HTMLInputElement, { value?: string, onClick?: () => void }>(({ value: displayValue, onClick }, ref) => (
         <div className="relative" onClick={onClick}>
            <input
                ref={ref}
                type="text"
                value={displayValue || ''}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500 pl-3 pr-10 py-2 cursor-pointer"
                placeholder="Select Date"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
    ));

    return (
        <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            customInput={<CustomInput />}
            dateFormat={dateFormatInput}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
        />
    );
}

const AttributeRenderer = ({ item, attribute, onChange, value }: { item: AttributeGroupItem, attribute: Attribute | undefined, onChange: (value: string) => void, value: string }) => {
    
    const renderContent = () => {
        // New logic: Check for new attribute structure first
        if (item.attribute) {
            switch (item.attribute.type) {
                case 'TEXT':
                    return <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500" placeholder={item.description} />;
                case 'DATE':
                    return <DateComponent value={value} onChange={onChange} />;
                case 'RADIO':
                    return <RadioGroupComponent value={value} onChange={onChange} options={item.attribute.attribute_enums} />;
                case 'ENUM':
                    return (
                        <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-dark-400 dark:border-dark-500">
                            <option value="">Select...</option>
                            {item.attribute.attribute_enums.map(opt => (
                                <option key={opt.id} value={opt.value}>{opt.value}</option>
                            ))}
                        </select>
                    );
                case 'TLP':
                    return <TlpComponent value={value} onChange={onChange} />;
                case 'CVSS':
                    return <CvssComponent value={value} onChange={onChange} />;
                case 'CVE':
                    return <input type="text" value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500" placeholder={item.description} />;
                case 'CWE':
                    return <input type="text" value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500" placeholder={item.description} />;
                case 'STRING':
                default:
                    return <input type="text" value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500" placeholder={item.description} />;
            }
        }

        // Fallback for old structure (Vulnerability Report)
        const normalizedTitle = item.title.toLowerCase();
        switch (normalizedTitle) {
            case 'cvss': return <CvssComponent value={value} onChange={onChange} />;
            case 'tlp': return <TlpComponent value={value} onChange={onChange} />;
            case 'confidentiality': return <ConfidentialityComponent value={value} onChange={onChange} />;
            case 'impact': return <ImpactComponent value={value} onChange={onChange} />;
            case 'exposure date':
            case 'update date':
                return <DateComponent value={value} onChange={onChange} />;
            default:
                return <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-dark-400 dark:border-dark-500" placeholder={item.description} />;
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</label>
            {renderContent()}
            {attribute && attribute.user && (
                <div className="text-xs text-gray-400 mt-1 text-right">
                    Last updated by {attribute.user.name} on {attribute.last_updated}
                </div>
            )}
        </div>
    );
};

// --- Main Component Interfaces ---
interface User {
    id: number;
    username: string;
    name: string;
}

interface Attribute {
    id: number;
    value: string;
    value_description: string;
    attribute_group_item_title: string | null;
    attribute_group_item_id: number;
    user: User;
    created: string;
    last_updated: string;
}

interface NewsItemData {
    id: string;
    title: string;
    link: string;
    published: string;
    collected: string;
}

interface NewsItem {
    id: number;
    news_item_data: NewsItemData;
}

interface NewsItemAggregate {
    id: number;
    title: string;
    created: string;
    news_items: NewsItem[];
}

interface ReportItem {
    id: number;
    uuid: string;
    title: string;
    title_prefix: string;
    created: string;
    last_updated: string;
    completed: boolean;
    report_item_type_id: number;
    news_item_aggregates: NewsItemAggregate[];
    attributes: Attribute[];
}

interface ReportItemType {
  id: number;
  title: string;
  description: string;
  attribute_groups: AttributeGroup[];
}

interface AttributeGroup {
    id: number;
    title: string;
    description: string;
    attribute_group_items: AttributeGroupItem[];
}

interface ReportItemFormState {
    title: string;
    title_prefix: string;
    completed: boolean;
    attributes: { [key: string]: string }; // key is attribute_group_item_id
}

const EditReportItemPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isNew = id === undefined;
    const navigate = useNavigate();
    
    // Data state
    const [reportItem, setReportItem] = useState<ReportItem | null>(null);
    const [reportItemType, setReportItemType] = useState<ReportItemType | null>(null);
    const [allReportTypes, setAllReportTypes] = useState<ReportItemType[]>([]);
    
    // Form state
    const [formData, setFormData] = useState<ReportItemFormState | null>(null);
    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching and Initialization ---
    useEffect(() => {
        const initializeNewReport = async () => {
            setLoading(true);
            try {
                const response = await intelligenceApi.get('/report-item-types');
                setAllReportTypes(response.data.items || []);
                // Initialize a minimal form data for name/prefix fields
                setFormData({ title: '', title_prefix: '', completed: false, attributes: {} });
            } catch (err) {
                setError('Failed to load report types.');
                console.error(err);
            }
            setLoading(false);
        };
        
        const fetchExistingReport = async (reportId: string) => {
            setLoading(true);
            try {
                const itemResponse = await intelligenceApi.get(`/analyze/report-items/${reportId}`);
                const fetchedItem: ReportItem = itemResponse.data;
                setReportItem(fetchedItem);

                const typesResponse = await intelligenceApi.get('/report-item-types');
                setAllReportTypes(typesResponse.data.items || []);

                const typeDefinition = (typesResponse.data.items || []).find(
                    (type: ReportItemType) => type.id === fetchedItem.report_item_type_id
                );
                
                if (typeDefinition) {
                    setReportItemType(typeDefinition);
                    const initialAttributes: { [key: string]: string } = {};
                    fetchedItem.attributes.forEach(attr => {
                        initialAttributes[attr.attribute_group_item_id.toString()] = attr.value;
                    });
                    setFormData({
                        title: fetchedItem.title,
                        title_prefix: fetchedItem.title_prefix,
                        completed: fetchedItem.completed,
                        attributes: initialAttributes,
                    });
                } else {
                    setError(`Could not find definition for type ID ${fetchedItem.report_item_type_id}.`);
                }
            } catch (err) {
                setError('Failed to fetch report data.');
                console.error(err);
            }
            setLoading(false);
        };

        if (isNew) {
            initializeNewReport();
        } else if(id) {
            fetchExistingReport(id);
        }
    }, [id, isNew]);

    const handleTypeSelect = (typeId: string) => {
        const selectedId = parseInt(typeId, 10);
        if (!selectedId) {
            setReportItemType(null);
            setReportItem(null);
            return;
        }

        const typeDefinition = allReportTypes.find(t => t.id === selectedId);
        if (typeDefinition) {
            setReportItemType(typeDefinition);

            // Initialize a blank report item and attributes for the form
            const initialAttributes: { [key: string]: string } = {};
            typeDefinition.attribute_groups.forEach(group => {
                group.attribute_group_items.forEach(item => {
                    initialAttributes[item.id.toString()] = "";
                });
            });
            
            setFormData(prev => ({ ...prev!, attributes: initialAttributes }));
            
            setReportItem({
                id: 0, uuid: '', title: '', title_prefix: '', created: '', last_updated: '',
                completed: false, report_item_type_id: typeDefinition.id,
                news_item_aggregates: [], attributes: [],
            });
        }
    };

    const handleAddNewsItems = (newItems: any[]) => {
        const existingIds = new Set(reportItem?.news_item_aggregates.map(item => item.id));
        const itemsToAdd = newItems
            .filter(item => !existingIds.has(item.id))
            .map(item => ({
                id: item.id,
                title: item.title,
                created: item.created,
                news_items: [] 
            }));
    
        if (itemsToAdd.length > 0) {
            setReportItem(prev => {
                if (!prev) return null;
                const updatedAggregates = [...prev.news_item_aggregates, ...itemsToAdd];
                const newState = { ...prev, news_item_aggregates: updatedAggregates };
                setFormData(currentForm => ({...currentForm!})); 
                return newState;
            });
        }
    };

    const handleFormChange = (field: keyof ReportItemFormState, value: any) => {
        setFormData(prev => (prev ? { ...prev, [field]: value } : null));
    };

    const handleAttributeChange = (groupItemId: number, value: string) => {
        setFormData(prev => {
            if (!prev) return null;
            const newAttributes = { ...prev.attributes, [groupItemId.toString()]: value };
            return { ...prev, attributes: newAttributes };
        });
    };

    const handleSave = useCallback(async () => {
        const currentFormData = formDataRef.current;

        if (!currentFormData || !reportItemType) {
            setError("Form data is not ready. Please select a report type and fill in the details.");
            return;
        }

        setLoading(true);
        setError(null);

        const attributesPayload = Object.entries(currentFormData.attributes).map(([groupItemId, value]) => ({
            attribute_group_item_id: parseInt(groupItemId, 10),
            value: value,
        }));
            
        const payload = {
            title: currentFormData.title,
            title_prefix: currentFormData.title_prefix,
            completed: currentFormData.completed,
            report_item_type_id: reportItemType.id,
            attributes: attributesPayload,
            news_item_aggregates: reportItem?.news_item_aggregates.map(agg => ({ id: agg.id })) || [],
        };

        try {
            if (isNew) {
                await intelligenceApi.post('/analyze/report-items', payload);
            } else {
                await intelligenceApi.put(`/analyze/report-items/${id}`, payload);
            }
            navigate('/intelligence/analyze/report-items');
        } catch (err) {
            const errorMsg = (err as any).response?.data?.error || "Failed to save report item.";
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isNew, id, reportItemType, reportItem, navigate]);

    const getAttributeForGroupItem = (groupItemId: number): Attribute | undefined => {
        return reportItem?.attributes.find(attr => attr.attribute_group_item_id === groupItemId);
    };

    if (loading && !formData) { // Show loading only on initial page load
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!formData) { // Should not happen if loading logic is correct, but a good guard
        return <div className="p-8 text-center">Initializing form...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-dark-500">
            {/* Header */}
            <div className="bg-white dark:bg-dark-300 shadow-sm p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={() => navigate('/intelligence/analyze/report-items')} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-400">
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">
                            {isNew ? 'Create Report Item' : `Edit Report Item`}
                        </h1>
                         {!isNew && <span className="text-xs text-gray-500">ID: {reportItem?.uuid}</span>}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                     <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={formData.completed}
                            onChange={(e) => handleFormChange('completed', e.target.checked)}
                        />
                        <span>completed</span>
                    </label>
                    <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 disabled:bg-blue-400">
                        <Save size={18} className="mr-2" />
                        {loading ? 'SAVING...' : 'SAVE'}
                    </button>
                </div>
            </div>

            {/* Sub-Header / Type Selector */}
            <div className="bg-gray-50 dark:bg-dark-200 p-4 flex justify-between items-center border-b dark:border-dark-400">
                <div className="flex items-center space-x-4 flex-grow">
                    <div>
                        <label className="text-xs text-gray-500">Report Item Type</label>
                        {isNew ? (
                             <select 
                                 onChange={(e) => handleTypeSelect(e.target.value)}
                                 className="w-full p-1 border rounded-md dark:bg-dark-300 dark:border-dark-400"
                                 defaultValue=""
                             >
                                 <option value="" disabled>-- Select a Type --</option>
                                 {allReportTypes.map(type => (
                                     <option key={type.id} value={type.id}>{type.title}</option>
                                 ))}
                             </select>
                        ) : (
                            <p className="font-semibold">{reportItemType?.title || 'Loading...'}</p>
                        )}
                    </div>
                     <div className="flex-grow">
                        <label className="text-xs text-gray-500">Name prefix</label>
                        <input
                            type="text"
                            value={formData.title_prefix}
                            onChange={(e) => handleFormChange('title_prefix', e.target.value)}
                            className="w-full p-1 border rounded-md dark:bg-dark-300 dark:border-dark-400"
                        />
                    </div>
                     <div className="flex-grow">
                        <label className="text-xs text-gray-500">Name</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            className="w-full p-1 border rounded-md dark:bg-dark-300 dark:border-dark-400"
                        />
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(true)} disabled={!reportItemType} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 disabled:bg-gray-400 ml-4">
                    <Plus size={18} className="mr-2" />
                    ADD NEWS ITEMS
                </button>
            </div>

            {/* Main Content - Renders only when a type is selected */}
            {reportItemType && (
                 <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                    {/* Left Panel: News Items */}
                    <div className="w-1/3 bg-white dark:bg-dark-200 rounded-lg shadow-sm p-4 overflow-y-auto">
                        <h2 className="font-bold mb-4">News Items ({reportItem?.news_item_aggregates.length || 0})</h2>
                        {reportItem?.news_item_aggregates.map(agg => (
                             <div key={agg.id} className="border-l-4 border-blue-500 pl-3 mb-4">
                                <div className="text-xs text-gray-400 flex justify-between">
                                    <span>Collected: {agg.created}</span>
                                     <span>Published: {agg.news_items[0]?.news_item_data.published}</span>
                                </div>
                                <h3 className="font-bold text-lg my-2">{agg.title}</h3>
                                 <a href={agg.news_items[0]?.news_item_data.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm break-all hover:underline">
                                     {agg.news_items[0]?.news_item_data.link}
                                 </a>
                                 <div className="flex items-center text-gray-500 text-sm mt-2">
                                     <span className="mr-4">👍 0</span>
                                    <span>👎 0</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Panel: Attributes Form */}
                    <div className="w-2/3 bg-white dark:bg-dark-200 rounded-lg shadow-sm p-4 overflow-y-auto">
                         <h2 className="font-bold mb-4">Attributes</h2>
                         {reportItemType?.attribute_groups.map(group => (
                             <details key={group.id} className="mb-2" open>
                                <summary className="font-semibold cursor-pointer p-2 bg-gray-100 dark:bg-dark-300 rounded-md hover:bg-gray-200">
                                    {group.title}
                                </summary>
                                <div className="p-4 border dark:border-dark-400 rounded-b-md space-y-4">
                                   {group.attribute_group_items.map(item => {
                                       const attribute = getAttributeForGroupItem(item.id);
                                       const attributeValue = formData.attributes[item.id.toString()] || '';
                                       return (
                                         <AttributeRenderer 
                                           key={item.id}
                                           item={item} 
                                           attribute={attribute}
                                           value={attributeValue}
                                           onChange={(value) => handleAttributeChange(item.id, value)}
                                         />
                                       );
                                   })}
                                </div>
                             </details>
                         ))}
                    </div>
                </div>
            )}
           
            <AddNewsItemsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddItems={handleAddNewsItems}
                existingItemIds={reportItem?.news_item_aggregates.map(item => item.id) || []}
            />
        </div>
    );
};

export default EditReportItemPage; 