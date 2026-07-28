import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Controller, useFormContext } from "react-hook-form";
import { Pattern } from "./dnd-pattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const IdentifierPatterns = () => {
  const { control } = useFormContext<OrgSettingsForm>();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Identifier Patterns</h1>
        <p className="text-sm text-muted-foreground">
          Manage the logic for auto-generating employee and project IDs.
        </p>
      </div>

      <Controller
        name="employee_id_mode"
        control={control}
        render={({ field }) => (
          <Tabs
            className="w-full"
            value={field.value}
            onValueChange={field.onChange}
          >
            <TabsList className="grid grid-cols-2 gap-4 bg-transparent p-0 h-auto! w-full">
              <TabsTrigger
                value="auto"
                className="
                  data-[state=active]:border-primary!
                  data-[state=active]:bg-primary/10!
                  data-[state=active]:text-foreground
                  border-input
                  h-auto
                  rounded-lg
                  border
                  p-4
                  justify-start
                  text-left
                  whitespace-normal
                  text-foreground
                "
              >
                <div>
                  <div className="font-semibold">Auto-generate IDs</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Generate IDs automatically using prefixes, counters, and dates.
                  </div>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="manual"
                className="
                  data-[state=active]:border-primary!
                  data-[state=active]:bg-primary/10!
                  data-[state=active]:text-foreground
                  border-input
                  h-auto
                  rounded-lg
                  border
                  p-4
                  justify-start
                  text-left
                  whitespace-normal
                  text-foreground
                "
              >
                <div>
                  <div className="font-semibold">Manual entry</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Users enter IDs manually. Automatic formatting is disabled.
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auto" className="border bg-card p-4 rounded-lg">
              <Pattern />
            </TabsContent>

            <TabsContent
              value="manual"
              className="bg-warning/50 border-2 border-warning rounded-lg p-4"
            >
              <p className="text-sm">
                When creating a new{" "}
                <span className="font-semibold underline">Employee</span>, team
                members will see an open input field. Unique checks will still
                enforce non-duplicate entries, but pattern structure (like
                prefixes or sequence numbers) will not be forced.
              </p>
            </TabsContent>
          </Tabs>
        )}
      />
    </div>
  );
};

export default IdentifierPatterns;
