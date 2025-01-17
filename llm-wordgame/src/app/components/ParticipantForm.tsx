import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormSelect from "@/components/ui/formSelect";
import { Button } from "@/components/ui/button";
import { ParticipantFormData } from "../types/types";
import FormInput from "@/components/ui/formInput";
import AvatarSelector from "@/components/ui/avatarSelect";

const participantFormSchema = z.object({
  avatar: z.string(),
  username: z.string(),
  age: z.string().optional(),
  gender: z.string().optional(),
  languageSkill: z.string().optional(),
  occupation: z.string().optional(),
  educationLevel: z.string().optional(),
});

type ParticipantFormProps = {
  stateChange: () => void;
  setParticipantForm: (data: ParticipantFormData) => void;
};

export default function ParticipantForm({ stateChange, setParticipantForm }: ParticipantFormProps) {
  const form = useForm({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      avatar: "",
      username: "",
      age: "",
      gender: "",
      languageSkill: "",
      occupation: "",
      educationLevel: "",
    },
  });

  function onSubmit(values: z.infer<typeof participantFormSchema>) {
    setParticipantForm(values);
    stateChange();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-base">
              This game was developed as part of a bachelors thesis project.
              Fill out as much of the form as you feel comfortable with.
              <br />
              We do not collect any additional data beyond the game results and the data you provide here.
              <br />
              All fields except for the username are optional.
            </p>
          </div>
          <AvatarSelector
            onSelectAvatar={(avatar) => form.setValue("avatar", avatar)}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              form={form}
              name="username"
              label="Username *"
              placeholder="Username"
              description="This will be used to identify you on the leaderboard"
              required
            />
            <FormSelect
              form={form}
              name="age"
              label="Age"
              options={[
                { value: "under18", label: "Under 18" },
                { value: "18-24", label: "18-24" },
                { value: "25-34", label: "25-34" },
                { value: "35-44", label: "35-44" },
                { value: "45-54", label: "45-54" },
                { value: "55-64", label: "55-64" },
                { value: "65+", label: "65+" },
                { value: " ", label: "Don't want to answer" },
              ]}
            />
            <FormSelect
              form={form}
              name="gender"
              label="Gender"
              options={[
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
                { value: "diverse", label: "Diverse" },
                { value: " ", label: "Don't want to answer" },
              ]}
            />
            <FormSelect
              form={form}
              name="educationLevel"
              label="Education Level"
              description="Highest level of education completed"
              options={[
                { value: "none", label: "Less than high school degree" },
                { value: "highschool", label: "High school degree or equivalent" },
                { value: "associate", label: "Associate degree (e.g. AA, AS)" },
                { value: "bachelor", label: "Bachelor's degree" },
                { value: "master", label: "Graduate degree (e.g. Masters, PhD, M.D.)" },
                { value: " ", label: "Don't want to answer" },
              ]}
            />
            <FormSelect
              form={form}
              name="languageSkill"
              label="How would you rate your english language skills?"
              description="On a scale from 1 to 10 where 1 is not confident and 10 is very confident"
              options={[
                { value: "10", label: "10 - Very confident" },
                { value: "9", label: "9" },
                { value: "8", label: "8" },
                { value: "7", label: "7" },
                { value: "6", label: "6" },
                { value: "5", label: "5" },
                { value: "4", label: "4" },
                { value: "3", label: "3" },
                { value: "2", label: "2" },
                { value: "1", label: "1 - Not confident" },
                { value: " ", label: "Don't want to answer" },
              ]}
            />
          </div>
          <Button
            variant="outline_success"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}