'use client'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import { sortTypes } from "@/constants";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Sort = () => {

    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedSort = sortTypes.find(item => item.value === searchParams.get("sort"))?.value
        ?? sortTypes[0].value;

    const handleSort = (value: string | null) => {
        if (!value || value === selectedSort) return;
        // Preserve search and selected-file filters when changing the sort order.
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`${path}?${params.toString()}`, { scroll: false });
    }


    return (
    <Select items={sortTypes} onValueChange={handleSort} value={selectedSort}>
  <SelectTrigger aria-label="Sort files" className="min-w-40 border-gray-200 bg-white focus-visible:border-brand focus-visible:ring-brand/20">
    <SelectValue placeholder="Sort files" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {sortTypes.map((item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
    )
}

export default Sort;
